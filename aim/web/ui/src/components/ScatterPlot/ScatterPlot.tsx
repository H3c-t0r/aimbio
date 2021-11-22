import React from 'react';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import useResizeObserver from 'hooks/window/useResizeObserver';

import {
  IAttributesRef,
  IBrushRef,
} from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import {
  clearArea,
  drawArea,
  drawAxes,
  getAxisScale,
  drawPoints,
} from 'utils/d3';

import { IScatterPlotProps } from './types.d';

import './styles.scss';

const ScatterPlot = React.forwardRef(function ScatterPlot(
  props: IScatterPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data: { dimensions, data },
    zoom,
    onZoomChange,
    syncHoverState,
    index = 0,
    chartTitle,
    displayOutliers = false,
    highlightMode = HighlightEnum.Off,
  } = props;

  // boxes
  const visBoxRef = React.useRef({
    margin: {
      top: 30,
      right: 20,
      bottom: 50,
      left: 60,
    },
    height: 0,
    width: 0,
  });
  const plotBoxRef = React.useRef({
    height: 0,
    width: 0,
  });

  // containers
  const parentRef = React.useRef<HTMLDivElement>(null);
  const visAreaRef = React.useRef<HTMLDivElement>(null);

  // d3 node elements
  const svgNodeRef = React.useRef(null);
  const bgRectNodeRef = React.useRef(null);
  const plotNodeRef = React.useRef(null);
  const axesNodeRef = React.useRef(null);
  const linesNodeRef = React.useRef(null);
  const attributesNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const axesRef = React.useRef({});
  const brushRef = React.useRef<IBrushRef>({});
  const linesRef = React.useRef({});
  const attributesRef = React.useRef<IAttributesRef>({});
  const humanizerConfigRef = React.useRef({});
  const rafIDRef = React.useRef<number>();

  function draw() {
    // const { processedData, min, max, xValues } = processData(
    //   data,
    //   displayOutliers,
    // );

    drawArea({
      index,
      visBoxRef,
      plotBoxRef,
      parentRef,
      visAreaRef,
      svgNodeRef,
      bgRectNodeRef,
      plotNodeRef,
      axesNodeRef,
      linesNodeRef,
      attributesNodeRef,
      chartTitle,
    });

    const { width, height, margin } = visBoxRef.current;
    const [yDimension, xDimension] = Object.values(dimensions);

    const xScale = getAxisScale({
      domainData: xDimension.domainData,
      rangeData: [0, width - margin.left - margin.right],
      scaleType: xDimension.scaleType,
    });

    const yScale = getAxisScale({
      domainData: yDimension.domainData,
      rangeData: [height - margin.top - margin.bottom, 0],
      scaleType: yDimension.scaleType,
    });

    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;

    drawAxes({
      svgNodeRef,
      axesNodeRef,
      axesRef,
      plotBoxRef,
      xScale,
      yScale,
      width,
      height,
      margin,
      attributesRef,
      humanizerConfigRef,
      drawBgTickLines: { y: true },
    });

    drawPoints({
      index,
      data,
      xScale,
      yScale,
      highlightMode,
      pointsRef: linesRef,
      pointsNodeRef: linesNodeRef,
    });

    // drawHoverAttributes({
    //   index,
    //   data: data.data,
    //   highlightMode,
    //   syncHoverState,
    //   visAreaRef,
    //   attributesRef,
    //   plotBoxRef,
    //   visBoxRef,
    //   svgNodeRef,
    //   bgRectNodeRef,
    //   attributesNodeRef,
    //   linesNodeRef,
    //   highlightedNodeRef,
    //   humanizerConfigRef,
    //   drawAxisLines: { x: false, y: false },
    //   drawAxisLabels: { x: false, y: false },
    // });

    // drawBrush({
    //   index,
    //   brushRef,
    //   plotBoxRef,
    //   plotNodeRef,
    //   visBoxRef,
    //   axesRef,
    //   attributesRef,
    //   linesRef,
    //   svgNodeRef,
    //   axesScaleType,
    //   min,
    //   max,
    //   zoom,
    //   onZoomChange,
    // });
  }

  function renderChart() {
    clearArea({ visAreaRef });
    draw();
  }

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(renderChart);
      }
    },
    [data, dimensions, zoom, displayOutliers, highlightMode],
  );

  const observerReturnCallback = React.useCallback(() => {
    if (rafIDRef.current) {
      window.cancelAnimationFrame(rafIDRef.current);
    }
  }, []);

  useResizeObserver(resizeObserverCallback, parentRef, observerReturnCallback);

  React.useEffect(() => {
    rafIDRef.current = window.requestAnimationFrame(renderChart);
    return () => {
      if (rafIDRef.current) {
        window.cancelAnimationFrame(rafIDRef.current);
      }
    };
  }, [data, dimensions, zoom, displayOutliers, highlightMode]);

  React.useImperativeHandle(ref, () => ({
    setActiveLineAndCircle: (
      lineKey: string,
      focusedStateActive: boolean = false,
      force: boolean = false,
    ) => {
      attributesRef.current.setActiveLineAndCircle?.(
        lineKey,
        focusedStateActive,
        force,
      );
    },
    updateHoverAttributes: (xValue: number, dataSelector?: string) => {
      attributesRef.current.updateHoverAttributes?.(xValue, dataSelector);
    },
    clearHoverAttributes: () => {
      attributesRef.current.clearHoverAttributes?.();
    },
    setFocusedState: (focusedState: IFocusedState) => {
      attributesRef.current.focusedState = focusedState;
    },
  }));

  return (
    <div
      ref={parentRef}
      className={`ScatterPlot ${zoom?.active ? 'zoomMode' : ''}`}
    >
      <div ref={visAreaRef} />
    </div>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default React.memo(ScatterPlot);
