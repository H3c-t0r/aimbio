import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Icon } from 'components/kit';

import { GroupingPopover } from '../GroupingPopover';

import { IGroupingItemProps } from './GroupingItem.d';

import './GroupingItem.scss';

function GroupingItem({
  groupName,
  iconName = 'chart-group',
  inputLabel,
  advancedComponent,
  title,
  ...props
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const { engine } = props;
  const availableModifiers = engine.useStore(engine.additionalDataSelector);
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);

  return (
    <ErrorBoundary>
      <ControlPopover
        title={title ?? `Group by ${groupName}`}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title={`Group by ${groupName}`}>
            <div onClick={onAnchorClick} className='GroupingItem'>
              <div
                className={classNames('GroupingItem__iconBox', {
                  active: opened,
                  outlined:
                    !_.isNil(availableModifiers) &&
                    !_.isEmpty(currentValues[groupName].fields),
                })}
              >
                <Icon name={iconName} />
              </div>
            </div>
          </Tooltip>
        )}
        component={
          <GroupingPopover
            groupName={groupName}
            inputLabel={inputLabel}
            advancedComponent={advancedComponent}
            {...props}
          />
        }
      />
    </ErrorBoundary>
  );
}

export default React.memo<IGroupingItemProps>(GroupingItem);
