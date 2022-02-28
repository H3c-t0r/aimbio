import React, { memo } from 'react';
import { isEmpty, isNil } from 'lodash-es';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { IRunBatch, IRunDetailMetricsAndSystemTabProps } from './types';
import RunMetricCard from './RunMetricCard';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
  isRunBatchLoading,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    if (!runBatch && !isNil(runTraces)) {
      const runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
        runTraces.metric,
        runHash,
      );
      runsBatchRequestRef.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);

  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs[isSystem ? 'system' : 'metrics']
        .tabView,
    );
  }, [isSystem]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!isEmpty(runBatch) ? (
          <div className='RunDetailMetricsTab'>
            <div className='RunDetailMetricsTab__container'>
              {runBatch.map((batch: IRunBatch, i: number) => {
                return <RunMetricCard batch={batch} index={i} key={i} />;
              })}
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='runDetailParamsTabLoader'
            title={`No tracked ${isSystem ? 'system' : ''} metrics`}
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default memo(RunDetailMetricsAndSystemTab);
