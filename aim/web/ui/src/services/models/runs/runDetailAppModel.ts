import runsService from 'services/api/runs/runsService';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IRunBatch } from 'types/pages/runs/Runs';

import createModel from '../model';

const model = createModel<Partial<any>>({
  isRunInfoLoading: false,
  isExperimentsLoading: false,
  isRunBatchLoading: false,
});

let getRunsInfoRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getRunsBatchRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};
let getExperimentsDataRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

let getRunsOfExperimentRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

function initialize() {
  model.init();
}

function getExperimentsData() {
  if (getExperimentsDataRequestRef) {
    getExperimentsDataRequestRef.abort();
  }
  getExperimentsDataRequestRef = runsService.getExperimentsData();
  return {
    call: async () => {
      model.setState({ isExperimentsLoading: true });
      const data = await getExperimentsDataRequestRef.call();
      model.setState({
        isExperimentsLoading: false,
        experimentsData: data,
      });
      return data;
    },
    abort: getExperimentsDataRequestRef.abort,
  };
}

function getRunInfo(runHash: string) {
  if (getRunsInfoRequestRef) {
    getRunsInfoRequestRef.abort();
  }
  getRunsInfoRequestRef = runsService.getRunInfo(runHash);
  return {
    call: async () => {
      model.setState({ isRunInfoLoading: true });
      const data = await getRunsInfoRequestRef.call();
      model.setState({
        runParams: data.params,
        runTraces: data.traces,
        runInfo: data.props,
        isRunInfoLoading: false,
      });
      return data;
    },
    abort: getRunsInfoRequestRef.abort,
  };
}

function getRunsOfExperiment(runHash: string) {
  if (getRunsOfExperimentRequestRef) {
    getRunsOfExperimentRequestRef.abort();
  }
  getRunsOfExperimentRequestRef = runsService.getRunsOfExperiment(runHash);
  return {
    call: async () => {
      // model.setState({ isRunInfoLoading: true });
      const data = await getRunsOfExperimentRequestRef.call();
      model.setState({
        runsOfExperiment: data.runs,
        experimentId: data.id,
      });
      // return data;
    },
    abort: getRunsOfExperimentRequestRef.abort,
  };
}

function getRunBatch(body: any, runHash: string) {
  if (getRunsBatchRequestRef) {
    getRunsBatchRequestRef.abort();
  }
  getRunsBatchRequestRef = runsService.getRunBatch(body, runHash);
  return {
    call: async () => {
      model.setState({ isRunBatchLoading: true });

      const data = await getRunsBatchRequestRef.call();
      const runMetricsBatch: IRunBatch[] = [];
      const runSystemBatch: IRunBatch[] = [];
      data.forEach((run: IRunBatch) => {
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
        isRunBatchLoading: false,
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
    .then((res: any) => {
      model.setState({
        ...state,
        runInfo: {
          ...state?.runInfo,
          archived,
        },
      });
      if (res.id) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          message: archived
            ? 'Run successfully archived'
            : 'Run successfully unarchive',
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: 'Something went wrong',
        });
      }
      analytics.trackEvent(
        archived ? '[RunDetail] Archive Run' : '[RunDetail] Unarchive Run',
      );
    });
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

const runDetailAppModel = {
  ...model,
  initialize,
  getRunInfo,
  getRunBatch,
  getExperimentsData,
  getRunsOfExperiment,
  archiveRun,
  onNotificationAdd,
  onNotificationDelete,
};

export default runDetailAppModel;
