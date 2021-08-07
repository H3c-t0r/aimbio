import * as d3 from 'd3';
import { isNil, isEmpty } from 'lodash-es';

import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import {
  IActivePoint,
  INearestCircle,
} from 'types/utils/d3/drawHoverAttributes';
import {
  IDrawParallelHoverAttributesProps,
  IGetParallelNearestCirclesProps,
  IParallelClosestCircle,
} from 'types/utils/d3/drawParallelHoverAttributes';
import { getCoordinates, CircleEnum, ScaleEnum } from './';
import { IGetAxisScale } from '../../types/utils/d3/getAxisScale';
import getFormattedValue from '../formattedValue';

const drawParallelHoverAttributes = ({
  dimensions,
  index,
  attributesNodeRef,
  attributesRef,
  linesRef,
  visAreaRef,
  visBoxRef,
  closestCircleRef,
  syncHoverState,
  linesNodeRef,
  highlightedNodeRef,
  highlightMode,
}: IDrawParallelHoverAttributesProps) => {
  const chartRect: DOMRect = visAreaRef.current?.getBoundingClientRect() || {};
  const { margin } = visBoxRef.current;
  const svgArea = d3.select(visAreaRef.current).select('svg');
  const keysOfDimensions = Object.keys(dimensions);

  function getActivePoint(circle: INearestCircle): IActivePoint {
    const dimensionLabel = scalePointPosition(
      attributesRef.current.xScale,
      circle.x,
    );
    let yValue: number = 0;

    if (dimensions[dimensionLabel].scaleType === ScaleEnum.Point) {
      yValue = scalePointPosition(
        attributesRef.current.yScale[dimensionLabel],
        circle.y,
        true,
      );
    } else {
      yValue = getFormattedValue(
        attributesRef.current.yScale[dimensionLabel].invert(circle.y),
      );
    }

    // TODO changed pageX and pageY to
    //  topPos(bounded circle.y) and leftPos(bounded circle.x)
    return {
      key: circle.key,
      xValue: attributesRef.current.xScale(dimensionLabel),
      yValue,
      xPos: circle.x,
      yPos: circle.y,
      chartIndex: index,
      topPos: chartRect.top + circle.y + margin.top,
      leftPos: chartRect.left + circle.x + margin.left,
    };
  }

  function updateHoverAttributes(
    mouse: [number, number],
    brushEventUpdate: boolean = false,
  ) {
    const dimensionLabel = scalePointPosition(
      attributesRef.current.xScale,
      mouse[0],
    );
    if (dimensionLabel) {
      const { mouseX, mouseY } = getCoordinates({
        mouse,
        xScale: attributesRef.current.xScale,
        yScale: attributesRef.current.yScale[dimensionLabel],
        margin,
      });
      const { nearestCircles, closestCircle, lineCirclesOfClosestCircle } =
        getNearestCircles({
          data: linesRef.current.data,
          xScale: attributesRef.current.xScale,
          yScale: attributesRef.current.yScale,
          mouseX,
          mouseY,
          keysOfDimensions,
        });

      if (closestCircleRef.current !== closestCircle) {
        // hover Line Changed case
        if (
          closestCircle.key !== closestCircleRef.current?.key ||
          brushEventUpdate
        ) {
          linesNodeRef.current.classed(
            'highlight',
            highlightMode !== HighlightEnum.Off,
          );
          // previous line
          if (closestCircleRef.current?.key) {
            linesNodeRef.current
              .selectAll(`[id=Line-${closestCircleRef.current.key}]`)
              .classed('active', false);
            highlightedNodeRef.current.classed('highlighted', false);
          }
          // new line
          const newActiveLine = linesNodeRef.current.selectAll(
            `[id=Line-${closestCircle.key}]`,
          );
          if (!isEmpty(newActiveLine.nodes())) {
            const linesSelectorToHighlight =
              newActiveLine.attr('data-selector');
            // set highlighted lines
            highlightedNodeRef.current = linesNodeRef.current
              .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
              .classed('highlighted', true)
              .raise();
            // set active line
            newActiveLine?.classed('active', true).raise();
          }
        }
        // hover Circle Changed case
        if (
          closestCircle.x !== closestCircleRef.current?.x ||
          closestCircle.y !== closestCircleRef.current?.y ||
          brushEventUpdate
        ) {
          attributesNodeRef.current.classed(
            'highlight',
            highlightMode !== HighlightEnum.Off,
          );
          // Draw Circles
          attributesNodeRef.current
            .selectAll('circle')
            .data([...nearestCircles, ...lineCirclesOfClosestCircle])
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
          d3.selectAll(`[id=Circle-${closestCircle.key}]`)
            .attr('r', CircleEnum.ActiveRadius)
            .classed('active', true)
            .raise();
          d3.selectAll(`[id=Circle-${closestCircle.key}line]`)
            .attr('r', CircleEnum.ActiveRadius)
            .classed('active', true)
            .raise();
          if (typeof syncHoverState === 'function') {
            syncHoverState({ activePoint: getActivePoint(closestCircle) });
          }
        }
        closestCircleRef.current = closestCircle;

        attributesRef.current.x = closestCircle.x + margin.left;
        attributesRef.current.y = closestCircle.y + margin.top;
      }
    }
  }

  function setActiveLine(lineKey: string) {
    const { mouseX, mouseY } = getCoordinates({
      mouse: [attributesRef.current.x, attributesRef.current.y],
      xScale: attributesRef.current.xScale,
      yScale:
        attributesRef.current.yScale[
          scalePointPosition(
            attributesRef.current.xScale,
            attributesRef.current.x,
          )
        ],
      margin,
    });

    const { nearestCircles } = getNearestCircles({
      data: linesRef.current.data,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
      keysOfDimensions,
    });

    nearestCircles.forEach((circle: INearestCircle) => {
      if (circle.key !== lineKey) {
        return;
      }
      updateHoverAttributes([circle.x + margin.left, circle.y + margin.top]);
    });
  }

  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.setActiveLine = setActiveLine;

  function handleMouseMove(event: MouseEvent) {
    const mouse = d3.pointer(event);
    updateHoverAttributes(mouse);
  }

  svgArea?.on('mousemove', handleMouseMove);

  svgArea?.on('mouseleave', () => {
    if (closestCircleRef.current?.key) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .selectAll(`[id=Line-${closestCircleRef.current.key}]`)
        .classed('active', false);

      attributesNodeRef.current.classed('highlight', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${closestCircleRef.current.key}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${closestCircleRef.current.key}line]`)
        .remove();

      attributesNodeRef.current.selectAll('.HoverLine-y').remove();
    }
  });
};

// TODO IGetNearestCircles interface removed need to fix (returned any) type
function getNearestCircles({
  data,
  xScale,
  yScale,
  mouseX,
  mouseY,
  keysOfDimensions,
}: IGetParallelNearestCirclesProps): any {
  let closestCircles: IParallelClosestCircle[] = [
    {
      key: '',
      r: null,
      x: 0,
      y: 0,
      values: {},
      color: '',
    },
  ];
  const nearestCircles: INearestCircle[] = [];
  const lineCirclesOfClosestCircle: INearestCircle[] = [];
  for (const line of data) {
    const xAxesValues = keysOfDimensions.map((d: string) => xScale(d));
    const index = d3.bisectCenter(xAxesValues, mouseX);
    const closestXPixel = xScale(keysOfDimensions[index]);
    const closestYPixel = yScale[keysOfDimensions[index]](
      line.values[keysOfDimensions[index]],
    );
    // Find closest circles
    const rX = Math.abs(closestXPixel - mouseX);
    const rY = Math.abs(closestYPixel - mouseY);
    const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
    if (closestCircles[0].r === null || r <= closestCircles[0].r) {
      const circle = {
        key: line.key,
        values: line.values,
        color: line.color,
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
    if (!isNil(closestYPixel)) {
      nearestCircles.push({
        x: closestXPixel,
        y: closestYPixel,
        key: line.key,
        color: line.color,
      });
    }
  }
  closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
  keysOfDimensions.forEach((dimension: string) => {
    const closestXPixel = xScale(dimension);
    const closestYPixel = yScale[dimension](
      closestCircles[0].values[dimension],
    );
    if (nearestCircles[0]?.x !== closestXPixel && !isNil(closestYPixel)) {
      lineCirclesOfClosestCircle.push({
        x: closestXPixel,
        y: closestYPixel,
        key: closestCircles[0].key + 'line',
        color: closestCircles[0].color,
      });
    }
  });
  return {
    nearestCircles,
    closestCircle: closestCircles[0],
    lineCirclesOfClosestCircle,
  };
}

function scalePointPosition(
  xScale: IGetAxisScale,
  xPos: number,
  rangeReversed: boolean = false,
) {
  const domain = rangeReversed ? xScale.domain().reverse() : xScale.domain();
  const range = rangeReversed ? xScale.range().reverse() : xScale.range();
  const rangePoints = d3.range(
    range[0],
    range[1],
    xScale.step && xScale.step(),
  );
  return domain[d3.bisect(rangePoints, xPos) - 1];
}

export default drawParallelHoverAttributes;
