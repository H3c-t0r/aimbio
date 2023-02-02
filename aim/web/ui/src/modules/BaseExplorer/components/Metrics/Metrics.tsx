import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

import {
  useAggregateChartData,
  useSyncHoverState,
  useSetChartData,
  useAlignMetricsData,
} from './hooks';

function Metrics(props: IBoxContentProps) {
  const {
    visualizationName,
    engine,
    engine: { useStore },
    data,
    index,
    id,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];

  const chartRef = React.useRef<ILineChartRef>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const ignoreOutliers = useStore(
    vizEngine.controls.ignoreOutliers.stateSelector,
  );
  const highlighting = useStore(vizEngine.controls.highlighting.stateSelector);

  const { alignedData, axesPropsConfig } = useAlignMetricsData(
    engine,
    vizEngine,
    data,
  );
  const chartData = useSetChartData(alignedData);

  const [aggregatedData, aggregationConfig] = useAggregateChartData(
    engine,
    vizEngine,
    alignedData,
    axesPropsConfig.axesScaleType,
  );
  const syncHoverState = useSyncHoverState(engine, chartRef, id);

  return chartData?.length ? (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', padding: 10 }}
    >
      <LineChart
        ref={chartRef}
        id={id}
        nameKey={visualizationName}
        index={index}
        data={chartData}
        highlightMode={highlighting.mode}
        aggregatedData={aggregatedData}
        aggregationConfig={aggregationConfig}
        alignmentConfig={axesPropsConfig.alignment}
        axesScaleRange={axesPropsConfig.axesScaleRange}
        axesScaleType={axesPropsConfig.axesScaleType}
        ignoreOutliers={ignoreOutliers.isApplied}
        syncHoverState={syncHoverState}
      />
    </div>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);
