import json
import time
import queue
import logging
import shutil

from threading import Thread
from pathlib import Path
from typing import Dict

from aim.sdk.repo import Repo
from aim.storage.locking import AutoFileLock
from aim.ext.notifier import get_notifier, default_config_path, Notifier
from aim.ext.cleanup import AutoClean


logger = logging.getLogger(__name__)


class StatusEvent:
    def __init__(self, status_event_encoded: str):
        obj_idx, idx, _, epoch_time, next_event_in = status_event_encoded.split('-')
        self.idx: int = int(idx)
        self.obj_idx: str = obj_idx
        self.next_event_in: int = int(next_event_in)
        self.epoch_time: float = float(epoch_time)


class StatusNotification:
    def __init__(self, event: StatusEvent, message: str = None):
        self.event_idx = event.idx
        self.obj_idx = event.obj_idx
        self.message = message


class StatusEventSet:
    def __init__(self):
        self.events: Dict[str, StatusEvent] = {}

    def get(self, obj_idx: str) -> StatusEvent:
        return self.events[obj_idx]

    def add(self, event: StatusEvent) -> bool:
        object_idx = event.obj_idx
        if object_idx not in self.events:
            self.events[object_idx] = event
            return True
        elif self.events[object_idx].idx < event.idx:
            self.events[object_idx] = event
            return True
        return False


class WorkerThread(Thread):
    def __init__(self, func, **kwargs):
        self.shutdown = False
        self.func = func
        super().__init__(target=self.worker, **kwargs)

    def worker(self):
        while True:
            if self.shutdown:
                break
            self.func()

    def stop(self):
        logger.debug('Stopping worker thread...')
        self.shutdown = True
        self.join()
        logger.debug('Worker thread stopped.')


class NotificationQueue(object):
    def __init__(self, notifier: Notifier, notifications_cache_path: Path):
        self._notifications_cache_path = notifications_cache_path
        self.notifications_cache: Dict[str, int] = {}
        self.recover_notifications_cache()

        self._stopped = False
        self._notifier = notifier

        self._queue = queue.Queue()
        self._notifier_thread = Thread(target=self.listen, daemon=True)
        self._notifier_thread.start()

    def recover_notifications_cache(self):
        with self._notifications_cache_path.open() as cache_fh:
            try:
                self.notifications_cache = json.load(cache_fh)
            except json.decoder.JSONDecodeError:
                self.notifications_cache = {}

    def add_notification(self, notification: StatusNotification):
        if not self.is_sent(notification):
            self._queue.put(notification)

    def stop(self):
        logger.debug('Processing remaining notifications...')
        self._queue.join()
        logger.debug('Notifications queue is empty.')
        logger.debug('Stopping worker thread...')
        self._stopped = True
        self._notifier_thread.join()
        logger.debug('Worker thread stopped.')

    def is_sent(self, notification: StatusNotification) -> bool:
        last_event_idx = self.notifications_cache.get(notification.obj_idx, -1)
        if last_event_idx < notification.event_idx:
            return False
        elif last_event_idx == notification.event_idx:
            return True
        else:
            logger.warning(f'New event id {notification.event_idx} for object \'{notification.obj_idx}\' '
                           f'is less than last reported event id {last_event_idx}.')
            return True

    def update_last_sent(self, notification: StatusNotification):
        self.notifications_cache[notification.obj_idx] = notification.event_idx
        with self._notifications_cache_path.open(mode='w') as notifications_fh:
            json.dump(self.notifications_cache, notifications_fh)

    def listen(self):
        while True:
            if self._stopped:
                break
            try:
                notification = self._queue.get(timeout=1)
                if self.is_sent(notification):
                    logger.debug(f'Notification for object \'{notification.obj_idx}\' '
                                 f'with event ID {notification.event_idx} has already been sent. Skipping.')
                else:
                    details = {'run_hash': notification.obj_idx}
                    self._notifier.notify(notification.message, **details)
                    self.update_last_sent(notification)

                self._queue.task_done()
            except queue.Empty:
                continue


class RunStatusWatcherAutoClean(AutoClean['RunStatusWatcher']):
    PRIORITY = 30

    def __init__(self, instance: 'RunStatusWatcher') -> None:
        super().__init__(instance)
        self.is_background = instance.background
        self.watcher_thread = instance.watcher_thread
        self.notifications_queue = instance.notifications_queue
        self.lock = instance.lock

    def _close(self) -> None:
        if self.is_background:
            assert self.watcher_thread is not None
            self.watcher_thread.stop()
        self.notifications_queue.stop()
        self.lock.release()


class RunStatusWatcher:
    @staticmethod
    def has_watcher_config(repo: Repo) -> bool:
        repo_path = Path(repo.path)
        config_path = repo_path / 'ext' / 'notifications' / 'config.json'
        return config_path.is_file()

    @staticmethod
    def set_default_config(repo: Repo):
        repo_path = Path(repo.path)
        work_dir = repo_path / 'ext' / 'notifications'
        work_dir.mkdir(parents=True, exist_ok=True)

        config = work_dir / 'config.json'
        default_config = default_config_path()
        shutil.copy(default_config, config)

    def __init__(self, repo: Repo, background: bool = False):
        repo_path = Path(repo.path)
        self.background = background

        self._resources = None
        self.initialized = False

        work_dir = repo_path / 'ext' / 'notifications'
        work_dir.mkdir(parents=True, exist_ok=True)

        self.lock = AutoFileLock(work_dir / 'watcher.lock', timeout=0)
        try:
            self.lock.acquire()
        except TimeoutError:
            logger.error(f'Cannot start Run status watcher for \'{repo_path}\'. Failed to acquire lock.')
            return

        self._status_watch_dir: Path = repo_path / 'status'
        self._status_watch_dir.mkdir(exist_ok=True)

        self._notifications_cache_path: Path = work_dir / 'last_run_notifications'
        self._notifications_cache_path.touch(exist_ok=True)
        self._status_events = StatusEventSet()

        self.notifier = get_notifier(work_dir / 'config.json')
        self.watcher_thread = WorkerThread(self.check_for_new_events, daemon=True) if not background else None
        self.notifications_queue = NotificationQueue(self.notifier, self._notifications_cache_path)

        self.initialized = True
        self._resources = RunStatusWatcherAutoClean(self)

    def start_watcher(self):
        if not self.initialized:
            return
        logger.info('Starting watcher...')
        if self.background:
            self.watcher_thread.start()
        else:
            self.run_forever()

    def run_forever(self):
        while True:
            self.check_for_new_events()

    def check_for_new_events(self):
        new_events = self.poll_events()

        for new_event in new_events.events.values():
            if not self._status_events.add(new_event):
                event = self._status_events.get(new_event.obj_idx)
                epoch_now = time.time()
                failed = (event.next_event_in < epoch_now - event.epoch_time)
                if failed:
                    notification = StatusNotification(event)
                    self.notifications_queue.add_notification(notification)
            else:
                if new_event.next_event_in == 0:
                    notification = StatusNotification(new_event, 'Run \'{run_hash}\' finished without error.')
                    self.notifications_queue.add_notification(notification)

    def poll_events(self) -> StatusEventSet:
        events = StatusEventSet()
        for check_in_file_path in sorted(self._status_watch_dir.glob('*check_in*')):
            events.add(StatusEvent(check_in_file_path.name))
        return events
