import * as d3 from 'd3';

import { IDrawBrushProps, IHandleBrushChange } from 'types/utils/d3/drawBrush';
import { IGetAxisScale } from 'types/utils/d3/getAxesScale';
import getAxisScale from './getAxisScale';

function drawBrush(props: IDrawBrushProps): void {
  const {
    brushRef,
    plotBoxRef,
    plotNodeRef,
    visBoxRef,
    axesRef,
    attributesRef,
    linesRef,
    linesNodeRef,
    svgNodeRef,
    axisScaleType,
    min,
    max,
  } = props;

  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [plotBoxRef.current.width, plotBoxRef.current.height],
    ])
    .on('end', handleBrushChange);

  plotNodeRef.current.append('g').call(brush).attr('class', 'brush');

  brushRef.current.updateScales = function (
    xScale: IGetAxisScale['xScale'],
    yScale: IGetAxisScale['yScale'],
  ) {
    brushRef.current.xScale = xScale;
    brushRef.current.yScale = yScale;
  };

  // This remove the grey brush area as soon as the selection has been done
  function removeBrush() {
    plotNodeRef.current.select('.brush').call(brush.move, null);
  }

  // This event firing after brush selection ends
  function handleBrushChange(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    const extent: d3.BrushSelection | any = event.selection;
    const mousePosition = d3.pointer(event);
    if (!extent) {
      return;
    } else if (extent[1][0] - extent[0][0] < 5) {
      removeBrush();
    } else {
      // inverting pixels to x,y values
      const left: number = brushRef.current.xScale.invert(extent[0][0]);
      const right: number = brushRef.current.xScale.invert(extent[1][0]);

      const top: number = brushRef.current.yScale.invert(extent[0][1]);
      const bottom: number = brushRef.current.yScale.invert(extent[1][1]);

      const [xMin, xMax]: number[] = brushRef.current.xScale.domain();
      const [yMin, yMax]: number[] = brushRef.current.yScale.domain();

      const xValues: number[] | null =
        extent[1][0] - extent[0][0] < 5
          ? null
          : [left < xMin ? xMin : left, right > xMax ? xMax : right];

      const yValues: number[] | null =
        extent[1][1] - extent[0][1] < 5
          ? null
          : [bottom < yMin ? yMin : bottom, top > yMax ? yMax : top];

      handleZoomIn({
        xValues,
        yValues,
        mousePosition,
      });
    }
    svgNodeRef.current.on('dblclick', handleZoomOut);
    removeBrush();
  }

  function handleZoomIn({
    xValues,
    yValues,
    mousePosition,
  }: IHandleBrushChange): void {
    //
    const { width, height, margin } = visBoxRef.current;

    // updating Scales domain
    brushRef.current.xScale
      .domain(xValues)
      .range([0, width - margin.left - margin.right]);
    brushRef.current.yScale
      .domain(yValues)
      .range([height - margin.top - margin.bottom, 0]);

    // updating axes with new Scales
    axesRef.current.updateXAxis(brushRef.current.xScale);
    axesRef.current.updateYAxis(brushRef.current.yScale);

    attributesRef.current.updateHoverAttributes(undefined, mousePosition);

    linesNodeRef.current
      .selectAll('.Line')
      .transition()
      .duration(500)
      .attr(
        'd',
        linesRef.current.lineGenerator(
          brushRef.current.xScale,
          brushRef.current.yScale,
        ),
      );
  }

  function handleZoomOut(event: Event): void {
    const { xScale, yScale } = getAxisScale({
      visBoxRef,
      axisScaleType,
      min,
      max,
    });

    // setting axes to initial state
    axesRef.current.updateXAxis(xScale);
    axesRef.current.updateYAxis(yScale);

    // setting scales and lines to initial state
    brushRef.current.updateScales(xScale, yScale);
    linesRef.current.updateLines(xScale, yScale);

    attributesRef.current.updateScales(xScale, yScale);
    attributesRef.current.updateHoverAttributes(undefined, d3.pointer(event));
  }
}

export default drawBrush;
