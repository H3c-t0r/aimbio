import * as d3 from 'd3';

import 'components/LineChart/LineChart.css';
import {
  IClosestCircle,
  IDrawHoverAttributesProps,
  IGetCoordinates,
  IGetCoordinatesProps,
  IAxisLineData,
  INearestCircle,
  ISetAxisLabelProps,
  IGetNearestCirclesProps,
  IGetNearestCircles,
} from 'types/utils/d3/drawHoverAttributes';
import { CircleEnum, XAlignmentEnum } from './index';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';

import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    index,
    xAlignment,
    attributesNodeRef,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    closestCircleRef,
    xAxisLabelNodeRef,
    yAxisLabelNodeRef,
    linesNodeRef,
    highlightedNodeRef,
    highlightMode,
  } = props;

  attributesRef.current.updateScales = function (
    xScale: IGetAxesScale['xScale'],
    yScale: IGetAxesScale['yScale'],
  ) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  };

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  function handleMouseMove(mouse: [number, number]) {
    const { mouseX, mouseY } = getCoordinates({
      mouse,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      margin,
    });

    const { nearestCircles, closestCircle } = getNearestCircles({
      data,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
    });

    if (closestCircleRef.current !== closestCircle) {
      // hover Line Changed case
      if (closestCircle.key !== closestCircleRef.current?.key) {
        linesNodeRef.current.classed(
          'highlight',
          highlightMode !== HighlightEnum.Off,
        );
        // previous line
        if (closestCircleRef.current?.key) {
          linesNodeRef.current
            .select(`[id=Line-${closestCircleRef.current.key}]`)
            .classed('active', false);
          highlightedNodeRef.current.classed('highlighted', false);
        }
        // new line
        const newActiveLine = linesNodeRef.current.select(
          `[id=Line-${closestCircle.key}]`,
        );
        // get lines data selector
        const linesSelectorToHighlight = newActiveLine.attr('data-selector');

        // set highlighted lines
        highlightedNodeRef.current = linesNodeRef.current
          .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
          .classed('highlighted', true)
          .raise();

        // set active line
        newActiveLine.classed('active', true).raise();
      }

      // hover Circle Changed case
      if (
        closestCircle.x !== closestCircleRef.current?.x ||
        closestCircle.y !== closestCircleRef.current?.y
      ) {
        attributesNodeRef.current.classed(
          'highlight',
          highlightMode !== HighlightEnum.Off,
        );

        // FIXME need to check  axisLineData coords min max size
        const axisLineData: IAxisLineData[] = [
          { x1: closestCircle.x, y1: 0, x2: closestCircle.x, y2: height },
          { x1: 0, y1: closestCircle.y, x2: width, y2: closestCircle.y },
        ];

        // Draw horizontal/vertical lines
        attributesNodeRef.current
          .selectAll('line')
          .data(axisLineData)
          .join('line')
          .attr(
            'class',
            (d: IAxisLineData, i: number) =>
              `HoverLine HoverLine-${i === 0 ? 'x' : 'y'}`,
          )
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4 2')
          .style('fill', 'none')
          .attr('x1', (axisLine: IAxisLineData) => axisLine.x1)
          .attr('y1', (axisLine: IAxisLineData) => axisLine.y1)
          .attr('x2', (axisLine: IAxisLineData) => axisLine.x2)
          .attr('y2', (axisLine: IAxisLineData) => axisLine.y2)
          .lower();

        // Draw Circles
        attributesNodeRef.current
          .selectAll('circle')
          .data(nearestCircles)
          .join('circle')
          .attr('class', 'HoverCircle')
          .attr('id', (circle: INearestCircle) => `Circle-${circle.key}`)
          .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
          .attr('cx', (circle: INearestCircle) => circle.x)
          .attr('cy', (circle: INearestCircle) => circle.y)
          .attr('r', CircleEnum.Radius)
          .style('fill', (circle: INearestCircle) => circle.color)
          .on('click', function (this: SVGElement, circle: INearestCircle) {
            // TODO handle click
            d3.select(this).classed('active', false).classed('focus', true);
          });

        // set active circle
        d3.select(`[id=Circle-${closestCircle.key}]`)
          .attr('r', CircleEnum.ActiveRadius)
          .classed('active', true)
          .raise();

        setAxisLabel({
          closestCircle,
          visAreaRef,
          visBoxRef,
          plotBoxRef,
          xAxisLabelNodeRef,
          yAxisLabelNodeRef,
          xScale: attributesRef.current.xScale,
          yScale: attributesRef.current.yScale,
          xAlignment,
        });
      }

      closestCircleRef.current = closestCircle;
    }
  }

  attributesRef.current.updateHoverAttributes = handleMouseMove;

  svgArea?.on('mousemove', (event: MouseEvent) => {
    handleMouseMove(d3.pointer(event));
  });

  svgArea?.on('mouseleave', () => {
    if (closestCircleRef.current?.key) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .select(`[id=Line-${closestCircleRef.current.key}]`)
        .classed('active', false);

      attributesNodeRef.current.classed('highlight', false);

      attributesNodeRef.current
        .select(`[id=Circle-${closestCircleRef.current.key}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attributesNodeRef.current.select('.HoverLine-y').remove();

      yAxisLabelNodeRef.current?.remove();
    }
  });
}

function getNearestCircles({
  data,
  xScale,
  yScale,
  mouseX,
  mouseY,
}: IGetNearestCirclesProps): IGetNearestCircles {
  // Closest xPoint for mouseX
  const xPoint = xScale.invert(mouseX);

  let closestCircles: IClosestCircle[] = [
    {
      key: '',
      r: null,
      x: 0,
      y: 0,
    },
  ];

  const nearestCircles: INearestCircle[] = [];

  for (const line of data) {
    const index = d3.bisectCenter(line.data.xValues, xPoint);

    const closestXPixel = xScale(line.data.xValues[index]);
    const closestYPixel = yScale(line.data.yValues[index]);

    // Find closest circles
    const rX = Math.abs(closestXPixel - mouseX);
    const rY = Math.abs(closestYPixel - mouseY);
    const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
    if (closestCircles[0].r === null || r <= closestCircles[0].r) {
      const circle = {
        key: line.key,
        r,
        x: closestXPixel,
        y: closestYPixel,
      };
      if (r === closestCircles[0].r) {
        // Circle coordinates can be equal, to show only one circle on hover
        // we need to keep array of closest circles
        closestCircles.push(circle);
      } else {
        closestCircles = [circle];
      }
    }
    nearestCircles.push({
      x: closestXPixel,
      y: closestYPixel,
      key: line.key,
      color: line.color,
    });
  }
  closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
  return { nearestCircles, closestCircle: closestCircles[0] };
}

function getCoordinates({
  mouse,
  margin,
  xScale,
  yScale,
}: IGetCoordinatesProps): IGetCoordinates {
  const xPixel = Math.floor(mouse[0]) - margin.left;
  const yPixel = Math.floor(mouse[1]) - margin.top;
  const [xMin, xMax] = xScale.range();
  const [yMax, yMin] = yScale.range();

  return {
    mouseX: xPixel < xMin ? xMin : xPixel > xMax ? xMax : xPixel,
    mouseY: yPixel < yMin ? yMin : yPixel > yMax ? yMax : yPixel,
  };
}

function setAxisLabel({
  closestCircle,
  visAreaRef,
  visBoxRef,
  plotBoxRef,
  xAxisLabelNodeRef,
  yAxisLabelNodeRef,
  xAlignment,
  xScale,
  yScale,
}: ISetAxisLabelProps) {
  const { height, width, margin } = visBoxRef.current;
  const visArea = d3.select(visAreaRef.current);

  const xAxisTickValue = xScale.invert(closestCircle.x);

  // Set X axis value label related by 'xAlignment'
  // TODO change axis label related by x alignment
  // switch (xAlignment) {
  //   case XAlignmentEnum.Epoch:
  //     break;
  //   case XAlignmentEnum.RelativeTime:
  //     break;
  //   case XAlignmentEnum.AbsoluteTime:
  //     break;
  //   default:
  //     xAxisValueLabel = xAxisTickValue;
  // }

  // X Axis Label
  if (xAxisTickValue || xAxisTickValue === 0) {
    if (xAxisLabelNodeRef.current) {
      xAxisLabelNodeRef.current.remove();
      xAxisLabelNodeRef.current = null;
    }
    const formattedValue = Math.round(xAxisTickValue * 10e9) / 10e9;

    xAxisLabelNodeRef.current = visArea
      .append('div')
      .attr('class', 'ChartMouseValue ChartMouseValueXAxis')
      .style('top', `${height - margin.bottom + 1}px`)
      .text(formattedValue);

    const axisLeftEdge = margin.left - 1;
    const axisRightEdge = width - margin.right + 1;
    let xAxisValueWidth = xAxisLabelNodeRef.current.node().offsetWidth;
    if (xAxisValueWidth > plotBoxRef.current.width) {
      xAxisValueWidth = plotBoxRef.current.width;
    }

    xAxisLabelNodeRef.current
      .style('width', `${xAxisValueWidth}px`)
      .style(
        'left',
        `${
          closestCircle.x - xAxisValueWidth / 2 < 0
            ? axisLeftEdge + xAxisValueWidth / 2
            : closestCircle.x + axisLeftEdge + xAxisValueWidth / 2 >
              axisRightEdge
            ? axisRightEdge - xAxisValueWidth / 2
            : closestCircle.x + axisLeftEdge
        }px`,
      );
  }

  // Y Axis Label
  const yAxisTickValue = yScale.invert(closestCircle.y);

  if (yAxisTickValue || yAxisTickValue === 0) {
    if (yAxisLabelNodeRef.current) {
      yAxisLabelNodeRef.current.remove();
      yAxisLabelNodeRef.current = null;
    }

    const formattedValue = Math.round(yAxisTickValue * 10e9) / 10e9;
    yAxisLabelNodeRef.current = visArea
      .append('div')
      .attr('class', 'ChartMouseValue ChartMouseValueYAxis')
      .attr('title', formattedValue)
      .style('max-width', `${margin.left - 5}px`)
      .style('right', `${width - margin.left}px`)
      .text(formattedValue);

    const axisTopEdge = margin.top - 1;
    const axisBottomEdge = height - margin.top;
    const yAxisValueHeight = yAxisLabelNodeRef.current.node().offsetHeight;
    yAxisLabelNodeRef.current.style(
      'top',
      `${
        closestCircle.y - yAxisValueHeight / 2 < 0
          ? axisTopEdge + yAxisValueHeight / 2
          : closestCircle.y + axisTopEdge + yAxisValueHeight / 2 >
            axisBottomEdge
          ? axisBottomEdge - yAxisValueHeight / 2
          : closestCircle.y + axisTopEdge
      }px`,
    );
  }
}

export default drawHoverAttributes;
