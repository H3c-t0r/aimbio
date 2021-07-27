from aim.storage.run_metadata.entities import \
    ObjectFactory, Run, Tag, Experiment,\
    RunCollection, ExperimentCollection, TagCollection
from aim.storage.run_metadata.sql_engine.entities import ModelMappedRun, ModelMappedExperiment, ModelMappedTag


class ModelMappedFactory(ObjectFactory):
    def __init__(self):
        self._session = None

    def runs(self) -> RunCollection:
        return ModelMappedRun.all(session=self._session or self.get_session())

    def search_runs(self, term: str) -> RunCollection:
        return ModelMappedRun.search(term, session=self._session or self.get_session())

    def find_run(self, _id: str) -> Run:
        return ModelMappedRun.find(_id, session=self._session or self.get_session())

    def experiments(self) -> ExperimentCollection:
        return ModelMappedExperiment.all(session=self._session or self.get_session())

    def search_experiments(self, term: str) -> ExperimentCollection:
        return ModelMappedExperiment.search(term, session=self._session or self.get_session())

    def find_experiment(self, _id: str) -> Experiment:
        return ModelMappedExperiment.find(_id, session=self._session or self.get_session())

    def tags(self) -> TagCollection:
        return ModelMappedTag.search(session=self._session or self.get_session())

    def search_tags(self, term: str) -> TagCollection:
        return ModelMappedTag.search(term, session=self._session or self.get_session())

    def find_tag(self, _id: str) -> Tag:
        return ModelMappedTag.find(_id, session=self._session or self.get_session())

    def get_session(self):
        raise NotImplementedError

    def __enter__(self):
        self._session = self.get_session()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self._session.commit()
        else:
            self._session.rollback()
        self._session = None

