import React from 'react';
import { Grid, PopoverPosition, GridSize, Typography } from '@material-ui/core';
import _ from 'lodash-es';

import chartGridPattern from 'config/chart-grid-pattern/chartGridPattern';
import { chartTypesConfig } from './config';
import { ChartTypeEnum } from 'utils/d3';

import ChartPopover from './ChartPopover/ChartPopover';
import PopoverContent from './PopoverContent/PopoverContent';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import {
  IActivePoint,
  ISyncHoverStateParams,
} from 'types/utils/d3/drawHoverAttributes';

import './ChartPanel.scss';

const ChartPanel = React.forwardRef(function ChartPanel(
  props: IChartPanelProps,
  ref,
) {
  const [chartRefs] = React.useState<React.RefObject<any>[]>(
    new Array(props.data.length).fill('*').map(() => React.createRef()),
  );
  const [popoverPosition, setPopoverPosition] =
    React.useState<PopoverPosition | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const activePointRef = React.useRef<IActivePoint | null>(null);
  const popoverContentRef = React.useRef<HTMLDivElement>(null);

  const syncHoverState = React.useCallback(
    (params: ISyncHoverStateParams): void => {
      const { activePoint, focusedStateActive, dataSelector } = params;
      // on MouseHover
      activePointRef.current = activePoint;
      if (activePoint !== null) {
        if (props.chartType !== ChartTypeEnum.HighPlot) {
          chartRefs.forEach((chartRef, index) => {
            if (index === activePoint.chartIndex) {
              return;
            }
            chartRef.current?.updateHoverAttributes?.(
              activePoint.xValue,
              dataSelector,
            );
          });
        } else if (props.chartType === ChartTypeEnum.HighPlot) {
          chartRefs.forEach((chartRef, index) => {
            if (index === activePoint.chartIndex) {
              return;
            }
            chartRef.current?.clearHoverAttributes?.();
          });
        }

        if (props.onActivePointChange) {
          props.onActivePointChange(activePoint, focusedStateActive);
        }

        if (activePointRef.current && containerRef.current) {
          setPopoverPosition({
            top: activePointRef.current.topPos - containerRef.current.scrollTop,
            left:
              activePointRef.current.leftPos - containerRef.current.scrollLeft,
          });
        } else {
          setPopoverPosition(null);
        }
      }
      // on MouseLeave
      else {
        chartRefs.forEach((chartRef) => {
          chartRef.current?.clearHoverAttributes?.();
        });
        setPopoverPosition(null);
      }
    },
    [chartRefs, props.chartType, props.onActivePointChange, setPopoverPosition],
  );

  const onScroll = React.useCallback((): void => {
    if (popoverPosition) {
      if (activePointRef.current && containerRef.current) {
        setPopoverPosition({
          top: activePointRef.current.topPos - containerRef.current.scrollTop,
          left:
            activePointRef.current.leftPos - containerRef.current.scrollLeft,
        });
      } else {
        setPopoverPosition(null);
      }
    }
  }, [popoverPosition]);

  React.useImperativeHandle(ref, () => ({
    setActiveLineAndCircle: (
      lineKey?: string,
      focusedStateActive: boolean = false,
      force: boolean = false,
    ) => {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setActiveLineAndCircle?.(
          lineKey,
          focusedStateActive,
          force,
        );
      });
    },
  }));

  React.useEffect(() => {
    if (!props.panelResizing) {
      chartRefs.forEach((chartRef) => {
        chartRef.current?.setFocusedState?.(props.focusedState);
      });
    }
  }, [chartRefs, props.focusedState, props.panelResizing]);

  React.useEffect(() => {
    const debouncedScroll = _.debounce(onScroll, 100);
    const containerNode = containerRef.current;
    containerNode?.addEventListener('scroll', debouncedScroll);
    return () => {
      containerNode?.removeEventListener('scroll', debouncedScroll);
    };
  }, [onScroll]);

  return (
    <Grid container className='ChartPanel__container'>
      {props.panelResizing ? (
        <div className='ChartPanel__resizing'>
          <Typography variant='subtitle1' color='primary'>
            Release to resize
          </Typography>
        </div>
      ) : (
        <>
          <Grid item xs className='ChartPanel'>
            <Grid
              ref={containerRef}
              container
              className='ChartPanel__paper__grid'
            >
              {props.data.map((chartData: any, index: number) => {
                const Component = chartTypesConfig[props.chartType];
                return (
                  <Grid
                    key={index}
                    item
                    className='ChartPanel__paper__grid__chartBox'
                    xs={
                      props.data.length > 9
                        ? 4
                        : (chartGridPattern[props.data.length][
                            index
                          ] as GridSize)
                    }
                  >
                    <Component
                      ref={chartRefs[index]}
                      {...props.chartProps[index]}
                      index={index}
                      data={chartData}
                      syncHoverState={syncHoverState}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <ChartPopover
              containerRef={containerRef}
              popoverContentRef={popoverContentRef}
              popoverPosition={popoverPosition}
              open={
                props.resizeMode !== ResizeModeEnum.MaxHeight &&
                props.data.length > 0 &&
                !props.panelResizing &&
                !props.zoom?.active &&
                (props.tooltip.display || props.focusedState.active)
              }
            >
              <PopoverContent
                chartType={props.chartType}
                tooltipContent={props.tooltip.content}
                focusedState={props.focusedState}
                alignmentConfig={props.alignmentConfig}
              />
            </ChartPopover>
          </Grid>
          <Grid className='Metrics__controls__container' item>
            {props.controls}
          </Grid>
        </>
      )}
    </Grid>
  );
});

export default ChartPanel;
