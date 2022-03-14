import os.path
import time
import codecs
from typing import Optional
from logging import getLogger
from uuid import uuid4

from pyinstrument import Profiler
from pyinstrument.renderers import HTMLRenderer

from starlette.routing import Router
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = getLogger("profiler")


class PyInstrumentProfilerMiddleware:
    level = 0

    def __init__(
            self, app: ASGIApp,
            *,
            server_app: Optional[Router] = None,
            profiler_interval: float = 0.0001,
            repo_path=None,
            **profiler_kwargs
    ):
        self.app = app
        self._profiler = Profiler(interval=profiler_interval)

        self._server_app = server_app
        self._profiler_kwargs: dict = profiler_kwargs

        self._profiler_timestamp = str(time.time())
        self._profiler_log_path = os.path.join(repo_path, "profiler", self._profiler_timestamp)
        os.makedirs(self._profiler_log_path, exist_ok=True)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        if self._profiler.is_running:
            should_stop = False
        else:
            should_stop = True
            self._profiler.start()

        request = Request(scope, receive=receive)
        method = request.method
        path = request.url.path

        file_name = (
            '{timestamp}_{method}_{path}.html'.format(
                timestamp=time.time(),
                method=method.lower(),
                path='_'.join(path.strip('/').split('/')).lower()
            )
        )

        # Default status code used when the application does not return a valid response
        # or an unhandled exception occurs.
        status_code = 500

        async def wrapped_send(message: Message) -> None:
            if message['type'] == 'http.response.start':
                nonlocal status_code
                status_code = message['status']
            await send(message)

        try:
            await self.app(scope, receive, wrapped_send)
        finally:
            if scope["type"] == "http" and should_stop:
                self._profiler.stop()

                html_output = self._profiler.output_html(**self._profiler_kwargs)

                with open(os.path.join(self._profiler_log_path, file_name), 'w') as fs:
                    fs.write(html_output)
