import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { DensityOptions } from 'config/enums/densityEnum';

import { AppDataTypeEnum, AppNameEnum } from 'services/models/explorer';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IAggregationConfig,
  IAlignmentConfig,
  IPanelTooltip,
  IChartZoom,
  IFocusedState,
  IMetricAppModelState,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IParamsAppModelState } from 'types/services/models/params/paramsAppModel';
import { IRunsAppModelState } from 'types/services/models/runs/runsAppModel';
import {
  IScatterAppModelState,
  ITrendlineOptions,
} from 'types/services/models/scatter/scatterAppModel';

import { ChartTypeEnum, CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export interface IAppInitialConfig {
  dataType: AppDataTypeEnum;
  selectForm: AppNameEnum;
  grouping: boolean;
  appName: AppNameEnum;
  components: {
    table?: boolean;
    charts?: ChartTypeEnum[];
  };
}

export type IAppModelState =
  | IMetricAppModelState
  | IParamsAppModelState
  | IScatterAppModelState
  | IRunsAppModelState;

export interface IAppModelConfig {
  grouping?: IGroupingConfig;
  select?: ISelectConfig;
  table?: ITableConfig;
  pagination?: IPaginationConfig;
  liveUpdate?: ILiveUpdateConfig;
  chart?: Partial<IChart>;
}

export interface IChart
  extends ILineChartConfig,
    IHighPlotConfig,
    IScatterPlotConfig {
  trendlineOptions: ITrendlineOptions;
}

export interface IGroupingConfig {
  color?: string[];
  stroke?: string[];
  chart?: string[];
  row?: string[];
  reverseMode?: {
    color?: boolean;
    stroke?: boolean;
    chart?: boolean;
    row?: boolean;
  };
  isApplied?: {
    color?: boolean;
    stroke?: boolean;
    chart?: boolean;
    row?: boolean;
  };
  persistence?: {
    color: boolean;
    stroke: boolean;
  };
  seed?: {
    color: number;
    stroke: number;
  };
  paletteIndex?: number;
}

export interface ISelectOption {
  label: string;
  group: string;
  color: string;
  type?: string;
  value?: {
    option_name: string;
    context: { [key: string]: unknown } | null | any;
  };
}

export interface ISelectConfig {
  options: ISelectOption[];
  query: string;
  advancedMode?: boolean;
  advancedQuery?: string;
}

export interface ITableConfig {
  resizeMode?: ResizeModeEnum;
  rowHeight: RowHeightSize;
  sortFields?: SortField[];
  hiddenMetrics?: string[];
  hiddenColumns?: string[];
  hideSystemMetrics?: boolean;
  columnsWidths?: { [key: string]: number };
  columnsOrder?: IColumnsOrder;
  columnsColorScales?: { [key: string]: boolean };
  height?: string;
  selectedRows?: any;
}

interface IColumnsOrder {
  left: string[];
  middle: string[];
  right: string[];
}
export interface IPaginationConfig {
  limit: number;
  offset: null;
  isLatest: boolean;
}

export interface ILiveUpdateConfig {
  delay: number;
  enabled: boolean;
}

export interface IHighPlotConfig {
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  focusedState: IFocusedState;
  tooltip: IPanelTooltip;
  brushExtents: {
    [key: string]: {
      [key: string]: [number, number] | [string, string];
    };
  };
}

export interface ILineChartConfig {
  highlightMode: HighlightEnum;
  ignoreOutliers: boolean;
  zoom: IChartZoom;
  axesScaleType: IAxesScaleState;
  curveInterpolation: CurveEnum;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  aggregationConfig: IAggregationConfig;
  densityType: DensityOptions;
  alignmentConfig: IAlignmentConfig;
  focusedState: IFocusedState;
  tooltip: IPanelTooltip;
}

export interface IScatterPlotConfig {
  highlightMode: HighlightEnum;
  focusedState: IFocusedState;
  tooltip: IPanelTooltip;
}
