import React from 'react';
import { Popover, PopoverPosition } from '@material-ui/core';
import { isEqual } from 'lodash-es';

import useStyles from './ChartPopoverStyle';
import { IChartPopover } from '../../types/components/ChartPanel/ChartPopover';

function ChartPopover({
  id,
  popoverPosition,
  open = false,
  className = '',
  children,
  containerRef,
}: IChartPopover): JSX.Element | null {
  const classes = useStyles();

  const [popoverPos, setPopoverPos] = React.useState<PopoverPosition | null>(
    null,
  );

  const getPositionBasedOnOverflow = React.useCallback(
    (pos: PopoverPosition, containerRect: DOMRect): PopoverPosition => {
      let left;
      let top;

      if (pos.left < containerRect.left) {
        left = containerRect.left;
      } else if (pos.left > containerRect.left + containerRect.width) {
        left = containerRect.left + containerRect.width;
      } else {
        left = pos.left;
      }

      if (pos.top < containerRect.top) {
        top = containerRect.top;
      } else if (pos.top > containerRect.top + containerRect.height) {
        top = containerRect.top + containerRect.height;
      } else {
        top = pos.top;
      }

      return {
        left,
        top,
      };
    },
    [],
  );

  const onPopoverPositionChange = React.useCallback(
    (popoverPos: PopoverPosition | null): void => {
      if (popoverPos === null) {
        setPopoverPos(null);
      } else {
        // Popover viewport need to be overflowed by chart container
        const containerRect = containerRef?.current?.getBoundingClientRect();
        const pos = containerRect
          ? getPositionBasedOnOverflow(popoverPos, containerRect)
          : popoverPos;

        setPopoverPos((prevState) => {
          if (isEqual(prevState, pos)) {
            return prevState;
          }
          return pos;
        });
      }
    },
    [containerRef, getPositionBasedOnOverflow],
  );

  React.useEffect(() => {
    onPopoverPositionChange(popoverPosition);
  }, [popoverPosition, onPopoverPositionChange]);

  return !!popoverPos ? (
    <Popover
      id={id || 'popover'}
      open={open}
      anchorReference='anchorPosition'
      anchorPosition={popoverPos}
      className={`${classes.popover} ${className}`}
      classes={{ paper: classes.popoverContent }}
    >
      {children}
    </Popover>
  ) : null;
}

export default ChartPopover;
