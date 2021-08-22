import unittest
from fastapi.testclient import TestClient

from tests.utils import truncate_structured_db, truncate_api_db
from aim.sdk.repo import Repo
from aim.sdk.run import Run

from aim.web.run import app


class TestBase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.repo = Repo.default_repo()
        with cls.repo.structured_db:
            for run in cls.repo.iter_runs():
                run.props.name = run['name']

    @classmethod
    def tearDownClass(cls) -> None:
        # TODO [AT]: find a way to run this without breaking run.props in readonly mode
        truncate_structured_db(cls.repo.structured_db)

    def tearDown(self) -> None:
        self.repo.structured_db.invalidate_caches()
        Run.set_props_cache_hint(None)


class ApiTestBase(TestBase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        truncate_api_db()
        super().tearDownClass()
