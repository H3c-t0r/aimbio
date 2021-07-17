import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import { ITableRef } from 'types/components/Table/Table';
import { IMetricTableRowData } from 'types/services/models/metrics/metricsCollectionModel';
import { ITableColumn } from './components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  displayOutliers: boolean;
  zoomMode: boolean;
  curveInterpolation: CurveEnum;
  toggleDisplayOutliers: () => void;
  toggleZoomMode: () => void;
  onActivePointChange: (activePointData: IActivePointData) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
}

export interface IOnSmoothingChange {
  algorithm: string;
  factor: number;
  curveInterpolation: CurveEnum;
}
