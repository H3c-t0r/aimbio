import { RouteChildrenProps } from 'react-router-dom';
import { IMetric } from 'types/services/models/metrics/metricModel';
export interface IMetricProps extends Partial<RouteChildrenProps> {
  metricsCollection: [IMetric[]];
  tableRef: React.RefObject<HTMLDivElement>;
  chartRef: React.RefObject<HTMLDivElement>;
  wrapperRef: React.RefObject<HTMLDivElement>;
  handleResize: () => void;
}
