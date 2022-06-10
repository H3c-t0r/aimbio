import logging
from typing import Dict, Optional, Union
from typing import TYPE_CHECKING

from aim.storage.hashing import hash_auto
from aim.storage.treeview import TreeView
from aim.sdk.utils import generate_run_hash
from aim.sdk.repo_utils import get_repo
from aim.sdk.tracker import STEP_HASH_FUNCTIONS

if TYPE_CHECKING:
    from aim.sdk.repo import Repo

logger = logging.getLogger(__name__)


class BaseRun:
    def __new__(cls, *args, **kwargs):
        # prevent BaseRun from being instantiated directly
        if cls is BaseRun:
            raise TypeError(f'Only children of \'{cls.__name__}\' may be instantiated.')
        return object.__new__(cls)

    def __init__(self, run_hash: Optional[str] = None,
                 repo: Optional[Union[str, 'Repo']] = None,
                 read_only: bool = False):
        self.hash = run_hash or generate_run_hash()
        self.read_only = read_only
        self.repo = get_repo(repo)

        self._hash = None

        self.meta_tree: TreeView = self.repo.request_tree(
            'meta', self.hash, read_only=read_only, from_union=True
        ).subtree('meta')
        self.meta_run_tree: TreeView = self.meta_tree.subtree('chunks').subtree(self.hash)

        self.series_run_trees: Dict[int, TreeView] = {}
        series_tree = self.repo.request_tree(
            'seqs', self.hash, read_only=read_only
        ).subtree('seqs')
        for version in STEP_HASH_FUNCTIONS.keys():
            if version == 1:
                self.series_run_trees[version] = series_tree.subtree('chunks').subtree(self.hash)
            else:
                self.series_run_trees[version] = series_tree.subtree(f'v{version}').subtree('chunks').subtree(self.hash)

    def __hash__(self) -> int:
        if self._hash is None:
            def calc_hash() -> int:
                # TODO maybe take read_only flag into account?
                return hash_auto((self.hash, hash(self.repo)))

            self._hash = calc_hash()
        return self._hash

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.hash} repo={self.repo}>'

    def check_metrics_version(self) -> bool:
        metric_dtypes = ('float', 'float64', 'int')
        traces_tree = self.meta_run_tree.get('traces', {})

        v1_metric_found = False
        for ctx_metadata in traces_tree.values():
            for seq_metadata in ctx_metadata.values():
                if seq_metadata['dtype'] in metric_dtypes:
                    if seq_metadata.get('version', 1) == 1:
                        v1_metric_found = True
                        break
        return v1_metric_found

    def update_metrics(self):
        metric_dtypes = ('float', 'float64', 'int')
        series_meta_tree = self.meta_run_tree.subtree('traces')

        for ctx_id, ctx_traces in series_meta_tree.items():
            for name, trace_info in ctx_traces.items():
                if (trace_info['dtype'] in metric_dtypes) and (trace_info.get('version', 1) == 1):
                    series = self.series_run_trees[1].subtree((ctx_id, name))
                    new_series = self.series_run_trees[2].subtree((ctx_id, name))
                    step_view = new_series.array('step', dtype='int64').allocate()
                    val_view = new_series.array('val').allocate()
                    epoch_view = new_series.array('epoch', dtype='int64').allocate()
                    time_view = new_series.array('time', dtype='int64').allocate()
                    for (step, val), (_, epoch), (_, timestamp) in zip(
                            series.subtree('val').items(),
                            series.subtree('epoch').items(),
                            series.subtree('time').items()):
                        step_hash = hash_auto(step)
                        step_view[step_hash] = step
                        val_view[step_hash] = val
                        epoch_view[step_hash] = epoch
                        time_view[step_hash] = timestamp
                    self.meta_run_tree['traces', ctx_id, name, 'version'] = 2
                    del self.series_run_trees[1][(ctx_id, name)]
