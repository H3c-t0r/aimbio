import logging
import os
import json
import uuid
import contextlib

import segment.analytics as sa

logger = logging.getLogger(__name__)

aim_profile_path = os.path.expanduser('~/.aim_profile')


class Analytics:
    SEGMENT_WRITE_KEY = 'RrVqLHHD6WDXoFBkodO9KidodTtU92XO'

    def __init__(self):
        self.dev_mode = False
        self.initialized = False

        if os.path.exists(aim_profile_path):
            with open(aim_profile_path, 'r') as fh:
                self._profile = json.load(fh)
        else:
            with self._autocommit():
                self._profile = {
                    'telemetry': {
                        'enable': True,
                        'warning-shown': False
                    },
                    'user-id': str(uuid.uuid4())
                }

        self._user_id = self._profile['user-id']

    def track_install_event(self, aim_version: str) -> None:
        sa.write_key = Analytics.SEGMENT_WRITE_KEY
        sa.identify(user_id=self._user_id)

        self.track_event(event_name='[Aim] install', aim_version=aim_version)

    def track_event(self, *, event_name: str, **kwargs) -> None:
        if not self.dev_mode and self.telemetry_enabled:
            self.initialize()
            self._warn_once()
            sa.track(self._user_id, event=event_name, properties=kwargs)

    def initialize(self) -> None:
        if self.initialized:
            return

        sa.write_key = Analytics.SEGMENT_WRITE_KEY
        sa.identify(user_id=self._user_id)
        self.initialized = True

    @property
    def telemetry_enabled(self) -> bool:
        return self._profile['telemetry']['enable']

    @telemetry_enabled.setter
    def telemetry_enabled(self, enable: bool):
        if enable != self.telemetry_enabled:
            with self._autocommit():
                self._profile['telemetry']['enable'] = enable

    @property
    def warning_shown(self) -> bool:
        return self._profile['telemetry']['warning-shown']

    @contextlib.contextmanager
    def _autocommit(self):
        yield
        with open(aim_profile_path, 'w+') as fh:
            json.dump(self._profile, fh)

    def _warn_once(self):
        assert self.telemetry_enabled
        if not self.warning_shown:
            alert_msg = 'Aim collects anonymous usage analytics.'
            opt_out_msg = 'Read how to opt-out here: '
            opt_out_url = 'https://aimstack.readthedocs.io/en/latest/community/telemetry.html'
            line_width = max(len(opt_out_msg), len(alert_msg), len(opt_out_url)) + 8
            logger.warning('-' * line_width)
            logger.warning('{}{}{}'.format(' ' * ((line_width - len(alert_msg)) // 2),
                                           alert_msg,
                                           ' ' * ((line_width - len(alert_msg)) // 2)))
            logger.warning('{}{}{}'.format(' ' * ((line_width - len(opt_out_msg)) // 2),
                                           opt_out_msg,
                                           ' ' * ((line_width - len(opt_out_msg)) // 2)))
            logger.warning('{}{}{}'.format(' ' * ((line_width - len(opt_out_url)) // 2),
                                           opt_out_url,
                                           ' ' * ((line_width - len(opt_out_url)) // 2)))
            logger.warning('-' * line_width)
            with self._autocommit():
                self._profile['telemetry']['warning-shown'] = True


analytics = Analytics()
