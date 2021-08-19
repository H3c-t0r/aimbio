import runsService from 'services/api/runs/runsService';
import createModel from '../model';

const model = createModel<Partial<any>>({});

let getRunsInfoRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getRunsBatchRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

function initialize() {
  model.init();
}

function getRunInfo(runHush: string) {
  if (getRunsInfoRequestRef) {
    getRunsInfoRequestRef.abort();
  }
  getRunsInfoRequestRef = runsService.getRunInfo(runHush);
  return {
    call: async () => {
      const data = await getRunsInfoRequestRef.call();
      model.setState({
        runParams: data.params,
        runTraces: data.traces,
        runInfo: data.props,
      });
    },
    abort: getRunsInfoRequestRef.abort,
  };
}

function getRunBatch(body: any, runHush: string) {
  if (getRunsBatchRequestRef) {
    getRunsBatchRequestRef.abort();
  }
  getRunsBatchRequestRef = runsService.getRunBatch(body, runHush);
  return {
    call: async () => {
      const data = await getRunsBatchRequestRef.call();
      const runMetricsBatch: any[] = [];
      const runSystemBatch: any[] = [];
      data.forEach((run: any) => {
        if (run.metric_name.startsWith('__system__')) {
          runSystemBatch.push(run);
        } else {
          runMetricsBatch.push(run);
        }
      });
      model.setState({
        ...model.getState(),
        runMetricsBatch,
        runSystemBatch,
      });
    },
    abort: getRunsBatchRequestRef.abort,
  };
}

function archiveRun(id: string, archived: boolean = false) {
  const state = model.getState();
  runsService
    .archiveRun(id, archived)
    .call()
    .then(() => {
      model.setState({
        ...state,
        runInfo: {
          ...state?.runInfo,
          archived,
        },
      });
    });
}

const runDetailAppModel = {
  ...model,
  initialize,
  getRunInfo,
  getRunBatch,
  archiveRun,
};

export default runDetailAppModel;
