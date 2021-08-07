import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import React from 'react';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { IMetric } from './metricModel';
import { IRun } from './runModel';

export interface IMetricAppModelState {
  refs: {
    tableRef: { current: ITableRef | null };
    chartPanelRef: { current: IChartPanelRef | null };
  };
  rawData: IRun[];
  config: IMetricAppConfig;
  data: IMetricsCollection[];
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  params: string[];
}

export interface IMetricsCollection {
  config: unknown;
  color: string | null;
  dasharray: string | null;
  chartIndex: number;
  data: IMetric[];
}

interface IMetricAppConfig {
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      style: boolean;
    };
    seed: {
      color: number;
      style: number;
    };
    paletteIndex: number;
    selectOptions: GroupingSelectOptionType[];
  };
  chart: {
    highlightMode: HighlightEnum;
    displayOutliers: boolean;
    zoomMode: boolean;
    axesScaleType: IAxesScaleState;
    curveInterpolation: CurveEnum;
    smoothingAlgorithm: SmoothingAlgorithmEnum;
    smoothingFactor: number;
    focusedState: IFocusedState;
    aggregated: boolean;
  };
}

export interface IFocusedState {
  key: string | null;
  xValue: number | null;
  yValue: number | null;
  active: boolean;
  chartIndex: number | null;
}

export interface IMetricTableRowData {
  key: string;
  dasharray: metric.dasharray;
  color: metric.color;
  experiment: metric.run.experiment_name;
  run: metric.run.name;
  metric: metric.metric_name;
  context: string[];
  value: string;
  iteration: string;
}

export interface IGetDataAsLinesProps {
  smoothingFactor?: number;
  smoothingAlgorithm?: string;
  collection?: IMetric[][];
}

export interface IOnGroupingSelectChangeParams {
  groupName: GroupNameType;
  list: string[];
}

export interface IOnGroupingModeChangeParams {
  groupName: GroupNameType;
  value: boolean;
  options?: any[] | null;
}

export interface IGetGroupingPersistIndex {
  groupValues: {
    [key: string]: IMetricsCollection;
  };
  groupKey: string;
  grouping: IMetricAppConfig['grouping'];
}

export type GroupNameType = 'color' | 'style' | 'chart';
export type GroupingSelectOptionType = {
  label: string;
  group: string;
  value: string;
};
