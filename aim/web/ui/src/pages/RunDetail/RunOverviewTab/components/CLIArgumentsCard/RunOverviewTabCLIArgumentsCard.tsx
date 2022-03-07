import React from 'react';

import { Card } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { IRunOverviewTabCLIArgumentsCardProps } from './RunOverviewTabCLIArgumentsCard.d';

function RunOverviewTabCLIArgumentsCard({
  cliArguments,
  isRunInfoLoading,
}: IRunOverviewTabCLIArgumentsCardProps) {
  const code: string = React.useMemo(
    () => (cliArguments || []).join(' '),
    [cliArguments],
  );
  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isRunInfoLoading} height='100%'>
        <Card title='CLI Arguments' className='RunOverviewTab__cardBox'>
          {code ? (
            <CodeBlock code={code} />
          ) : (
            <IllustrationBlock size='large' title='No Results' />
          )}
        </Card>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabCLIArgumentsCard.displayName = 'RunOverviewTabCLIArgumentsCard';

export default React.memo<IRunOverviewTabCLIArgumentsCardProps>(
  RunOverviewTabCLIArgumentsCard,
);
