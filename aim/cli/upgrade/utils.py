import os.path

import click
import shutil

from aim.cli.upgrade._legacy_repo import (
    AimRepo as LegacyRepo,
    Run as LegacyRun,
    deserialize_pb,
    AIM_MAP_METRICS_KEYWORD
)

from aim.sdk.utils import clean_repo_path
from aim.sdk.run import Run
from aim.sdk.repo import Repo


class RepoIntegrityError(Exception):
    pass


def get_legacy_run_hash(lrun: LegacyRun) -> str:
    return hex(hash(lrun.run_hash))[2:9]


def setup_directories(input_path: str):
    path = clean_repo_path(input_path)
    repo_path = path + '/.aim'
    if not (os.path.exists(repo_path) and os.path.isdir(repo_path)):
        click.echo(f'\'{input_path}\' does not seem to be Aim repository. Exiting.')
        exit(1)
    lrepo_path = path + '/.aim_legacy'
    shutil.move(repo_path, lrepo_path)
    return lrepo_path, repo_path


def collect_runs(lrepo: LegacyRepo):
    lruns = []
    for branch in lrepo.list_branches():
        for commit in lrepo.list_branch_commits(branch):
            lruns.append(LegacyRun(lrepo, experiment_name=branch, run_hash=commit))
    return lruns


def convert_run(lrun: LegacyRun, repo: Repo, legacy_run_map, skip_failed):
    try:
        run = Run(hashname=get_legacy_run_hash(lrun), repo=repo,
                  system_tracking_interval=None)  # do not track system metrics as they already logged if needed

        lrun.open_storage()
        if lrun.params.get(AIM_MAP_METRICS_KEYWORD):
            del lrun.params[AIM_MAP_METRICS_KEYWORD]  # set internally. no need to copy
        run[...] = lrun.params
        run['v2_params'] = {'run_hash': lrun.run_hash}
        if 'process' in lrun.config:
            run['v2_params', 'start_date'] = lrun.config['process']['start_date']
            run['v2_params', 'finish_date'] = lrun.config['process']['finish_date']

        run.experiment = lrun.experiment_name
        if lrun.config.get('archived'):
            run.archived = True

        run_metrics = {}
        legacy_run_map[lrun.run_hash] = run_metrics
        for metric in lrun.get_all_metrics().values():
            try:
                metric.open_artifact()
                run_metrics[metric.name] = []
                for trace in metric.get_all_traces():
                    metric_name = metric.name
                    context = trace.context
                    run_metrics[metric.name].append(context)
                    for r in trace.read_records(slice(0, None, 1)):
                        step_record, metric_record = deserialize_pb(r)
                        val = (metric_record.value, step_record.step, step_record.epoch, step_record.timestamp)
                        _track_legacy_run_step(run, metric_name, context, val)
            except Exception:
                metric.close_artifact()
                raise
            finally:
                metric.close_artifact()
        del run
    except Exception as e:
        click.echo(f'\nFailed to convert run {lrun.run_hash}. Reason: {str(e)}.', err=True)
        if not skip_failed:
            raise
    finally:
        lrun.close_storage()


def check_repo_integrity(repo: Repo, legacy_run_map: dict):
    try:
        ok = True
        with click.progressbar(repo.iter_runs(),
                               item_show_func=lambda r: (f'Checking run {r.hashname}' if r else '')) as runs:
            for run in runs:
                legacy_hash = run.get(['v2_params', 'run_hash'])
                run_metrics = legacy_run_map.pop(legacy_hash)
                for metric_name, ctx, _ in run.iter_metrics_info():
                    idx = run_metrics[metric_name].index(ctx.to_dict())
                    run_metrics[metric_name].pop(idx)
                    if not run_metrics[metric_name]:
                        del run_metrics[metric_name]
                if run_metrics:
                    click.echo(f'Run \'{run.hashname}\' [\'{legacy_hash}\'] missing metrics \'{run_metrics.keys()}\'.')
                    ok = False
        if legacy_run_map:
            click.echo(f'Repo missing runs \'{legacy_run_map.keys()}\'.')
            ok = False
    except (KeyError, ValueError):
        ok = False
    if not ok:
        raise RepoIntegrityError


def convert_2to3(path: str, drop_existing: bool = False, skip_failed_runs: bool = False, skip_checks: bool = False):
    lrepo_path, repo_path = setup_directories(path)

    def _rollback():
        shutil.rmtree(repo_path, ignore_errors=True)
        shutil.move(lrepo_path, repo_path)

    try:
        click.echo('Preparing new repository...')
        lrepo = LegacyRepo(mode=LegacyRepo.READING_MODE, repo_full_path=lrepo_path)
        repo = Repo.from_path(repo_path, init=True)
        repo.structured_db.run_upgrades()

        click.echo('Analyzing legacy repository...')
        lruns = collect_runs(lrepo)
        click.echo(f'Collected {len(lruns)} runs.')

        legacy_run_map = {}
        with repo.structured_db:
            with click.progressbar(
                    lruns, show_pos=True, item_show_func=lambda r: (f'Converting run {r.run_hash}' if r else '')
            ) as legacy_runs:
                for lrun in legacy_runs:
                    convert_run(lrun, repo, legacy_run_map, skip_failed=skip_failed_runs)

        if not skip_checks:
            click.echo('Checking repository integrity...')
            check_repo_integrity(repo, legacy_run_map)
            click.echo('Repository integrity check passed!')
        else:
            click.echo('WARN Skipping repository integrity checks.')
    except KeyboardInterrupt:
        click.echo('Convert interrupted by client. Rolling back...')
        _rollback()
        return
    except RepoIntegrityError:
        click.echo('Repository integrity check failed. Rolling back...', err=True)
        click.echo('If you want to convert repository anyway, please rerun command with \'--skip-checks\' flag.')
        _rollback()
        return
    except Exception as e:
        click.echo(f'Failed to convert repository. '
                   f'Reason: {str(e)}')
        _rollback()
        return
    if drop_existing:
        click.echo('Removing legacy repository...')
        shutil.rmtree(lrepo_path)
    else:
        click.echo(f'Legacy repository can be found at \'{lrepo_path}\'.')
    click.echo('DONE')


# this is a duplicate of run.track() method allowing to set timestamp. used for legacy data migration only.
def _track_legacy_run_step(run: Run, metric_name: str, context: dict, val):
    (value, step, epoch, timestamp) = val

    from aim.storage.context import Context, MetricDescriptor
    if context is None:
        context = {}

    ctx = Context(context)
    metric = MetricDescriptor(metric_name, ctx)

    if ctx not in run.contexts:
        run.meta_tree['contexts', ctx.idx] = ctx.to_dict()
        run.meta_run_tree['contexts', ctx.idx] = ctx.to_dict()
        run.contexts[ctx] = ctx.idx
        run._idx_to_ctx[ctx.idx] = ctx

    time_view = run.series_run_tree.view(metric.selector).array('time').allocate()
    val_view = run.series_run_tree.view(metric.selector).array('val').allocate()
    epoch_view = run.series_run_tree.view(metric.selector).array('epoch').allocate()

    max_idx = run.series_counters.get((ctx, metric_name), None)
    if max_idx is None:
        max_idx = len(val_view)
    if max_idx == 0:
        run.meta_tree['traces', ctx.idx, metric_name] = 1
    run.meta_run_tree['traces', ctx.idx, metric_name, "last"] = value

    run.series_counters[ctx, metric_name] = max_idx + 1

    time_view[step] = timestamp
    val_view[step] = value
    epoch_view[step] = epoch
