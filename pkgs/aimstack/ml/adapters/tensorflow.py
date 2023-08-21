from typing import Optional

from aimstack.asp import Run
from aimstack.ml.adapters.keras_mixins import TrackerKerasCallbackMetricsEpochEndMixin
from aim._ext.system_info import DEFAULT_SYSTEM_TRACKING_INT

try:
    from tensorflow.keras.callbacks import Callback
except ImportError:
    raise RuntimeError(
        'This contrib module requires tensorflow to be installed. '
        'Please install it with command: \n pip install tensorflow'
    )


class AimCallback(TrackerKerasCallbackMetricsEpochEndMixin, Callback):
    """
    AimCallback callback class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
            metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        capture_terminal_logs (:obj:`bool`, optional): Enable/Disable terminal stdout logging.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: Optional[bool] = True,
        capture_terminal_logs: Optional[bool] = True,
    ):
        super(Callback, self).__init__()

        self._system_tracking_interval = system_tracking_interval
        self._log_system_params = log_system_params
        self._capture_terminal_logs = capture_terminal_logs

        self._run = Run(repo=repo)
        if experiment_name is not None:
            self._run.experiment = experiment_name
        if log_system_params:
            self._run.enable_system_monitoring()

        self._run_hash = self._run.hash
        self._repo_path = repo

    @property
    def experiment(self) -> Run:
        if not self._run:
            self._run = Run(self._run_hash, repo=self._repo_path)
            if self._log_system_params:
                self._run.enable_system_monitoring()
        return self._run

    @classmethod
    def metrics(
        cls,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        run: Optional[Run] = None,
    ):
        # Keep `metrics` method for backward compatibility
        return cls(repo, experiment, run)

    def close(self) -> None:
        if self._run is not None:
            del self._run
            self._run = None

    def __del__(self):
        self.close()


# Keep `AimTracker` for backward compatibility
AimTracker = AimCallback
