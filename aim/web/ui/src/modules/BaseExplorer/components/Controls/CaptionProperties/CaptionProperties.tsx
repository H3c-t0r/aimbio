import React from 'react';
import classNames from 'classnames';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import CaptionPropertiesPopover from './CaptionPropertiesPopover';

import { ICaptionProperties, ICaptionPropertiesProps } from './';

function CaptionProperties(props: ICaptionPropertiesProps) {
  const {
    engine,
    engine: {
      useStore,
      controls: {
        captionProperties: { stateSelector },
      },
    },
  } = props;
  const captionProperties: ICaptionProperties = useStore(stateSelector);
  const title = 'Box caption';
  return (
    <ErrorBoundary>
      <ControlPopover
        title={title}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        anchor={({ onAnchorClick, opened }) => (
          <Button
            title={title}
            size='xSmall'
            onClick={onAnchorClick}
            className={classNames('Control__anchor', {
              active: opened || !captionProperties.isInitial,
              outlined: !opened && !captionProperties.isInitial,
            })}
          >
            <Icon
              className={classNames('Control__icon', {
                active: opened || !captionProperties.isInitial,
              })}
              name='info-circle-outline'
            />
            <Text className='Control__text'>{title}</Text>
            <Icon
              name='arrow-down-contained'
              className={classNames('Control__anchor__arrow', { opened })}
              fontSize={6}
            />
          </Button>
        )}
        component={
          <CaptionPropertiesPopover
            engine={engine}
            captionProperties={captionProperties}
          />
        }
      />
    </ErrorBoundary>
  );
}

CaptionProperties.displayName = 'CaptionProperties';

export default React.memo<IBaseComponentProps>(CaptionProperties);
