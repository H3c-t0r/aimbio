import { TraceRawDataItem } from 'services/models/runs/types';

export interface IRunDetailParamsTabProps {
  runParams: { [key: string]: any };
  isRunInfoLoading: boolean;
}

export interface IRunsProps {
  tableData: IRun<IMetricTrace | IParamTrace>[];
}
export interface IRunDetailMetricsAndSystemTabProps {
  runHash: string;
  runTraces: any;
  runBatch: any;
  isSystem?: boolean;
  isRunBatchLoading: boolean;
}
export interface IRunDetailSettingsTabProps {
  runHash: string;
  isArchived: boolean;
}

export interface IRunBatch {
  context: { [key: string]: string };
  iters: number[];
  name: string;
  values: number[];
}
export interface IRunInfo {
  archived: boolean;
  creation_time: number;
  end_time: number;
  experiment: {
    id: string;
    name: string;
  };
  name: string;
  tags: any[];
}

export interface IRunSelectPopoverContentProps {
  getRunsOfExperiment: (
    id: string,
    params?: { limit: number; offset?: string },
    isLoadMore?: boolean,
  ) => void;
  experimentsData: IRunSelectExperiment[];
  experimentId: string;
  runsOfExperiment: IRunSelectRun[];
  runInfo: any;
  isRunsOfExperimentLoading: boolean;
  isRunInfoLoading: boolean;
  isLoadMoreButtonShown: boolean;
  onRunsSelectToggle: () => void;
  dateNow: number;
}

export interface IRunSelectExperiment {
  archived: boolean;
  id: string;
  name: string;
  run_count: number;
}
export interface IRunSelectRun {
  creation_time: number;
  end_time: number;
  name: string;
  run_id: string;
}

export interface IRunDistributionsTabProps {
  runHash: string;
  runInfo: Record<'images' | 'distributions', InfoRawDataItem[]>;
  isRunBatchLoading: boolean;
}

export interface IDistributionVisualizerProps {
  isLoading?: boolean;
  activeTraceContext?: string;
  data: any;
}

export interface ITraceVisualizationContainerProps {
  traceInfo: Record<'images' | 'distributions', TraceRawDataItem[]>;
  traceType: 'images' | 'distributions';
  runHash: string;
}
