import * as d3 from 'd3';
import { IDrawBrushProps } from 'types/utils/d3/drawBrush';

function drawBrush(props: IDrawBrushProps): void {
  const { brushRef, plotBoxRef, plotRef, handleBrushChange } = props;

  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [plotBoxRef.current.width, plotBoxRef.current.height],
    ])
    .on('end', handleZoomChange);
  plotRef.current.append('g').call(brush).attr('class', 'brush');

  brushRef.current.updateScales = function (
    xScale: d3.AxisScale<any>,
    yScale: d3.AxisScale<any>,
  ) {
    brushRef.current.xScale = xScale;
    brushRef.current.yScale = yScale;
  };

  function handleZoomChange(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    const extent: d3.BrushSelection | any = event.selection;

    if (!extent) {
      return;
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

      handleBrushChange({
        xValues,
        yValues,
      });
    }
    // This remove the grey brush area as soon as the selection has been done
    plotRef.current.select('.brush').call(brush.move, null);
  }
}

export default drawBrush;
