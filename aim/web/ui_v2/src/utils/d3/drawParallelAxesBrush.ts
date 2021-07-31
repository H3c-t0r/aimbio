import * as d3 from 'd3';
import { isNil } from 'lodash-es';

import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
import { LinesDataType } from 'types/utils/d3/drawParallelLines';
import {
  IDrawParallelAxesBrushBrushProps,
  IFilterDataByBrushedScaleProps,
  DomainsDataType,
} from 'types/utils/d3/drawParallelAxesBrush';

function drawParallelAxesBrush({
  brushRef,
  plotBoxRef,
  plotNodeRef,
  dimensions,
  data,
  linesRef,
  attributesRef,
}: IDrawParallelAxesBrushBrushProps): void {
  brushRef.current.xScale = attributesRef.current.xScale;
  brushRef.current.yScale = { ...attributesRef.current.yScale };
  brushRef.current.domainsData = Object.keys(dimensions).reduce(
    (acc: DomainsDataType, keyOfDimension: string) => {
      acc[keyOfDimension] = dimensions[keyOfDimension].domainData;
      return acc;
    },
    {},
  );

  function handleBrushChange(
    event: d3.D3BrushEvent<d3.BrushSelection>,
    keyOfDimension: string,
  ): void {
    const extent: d3.BrushSelection | any = event.selection;
    if (!isNil(extent)) {
      if (dimensions[keyOfDimension].scaleType === 'point') {
        const domainData = scalePointDomainData(
          brushRef.current.yScale[keyOfDimension],
          extent,
        );
        brushRef.current.domainsData[keyOfDimension] = domainData;
      } else {
        const top: number | string = brushRef.current.yScale[
          keyOfDimension
        ].invert(extent[0]);
        const bottom: number | string = brushRef.current.yScale[
          keyOfDimension
        ].invert(extent[1]);
        brushRef.current.domainsData[keyOfDimension] = [bottom, top];
      }

      const filteredData = data.filter((line: LinesDataType) =>
        filterDataByBrushedScale({
          line,
          domainsData: brushRef.current.domainsData,
          dimensions,
        }),
      );
      linesRef.current.updateLines(filteredData);
      linesRef.current.data = filteredData;
      attributesRef.current.updateHoverAttributes(
        [brushRef.current.xScale(keyOfDimension), extent[0]],
        true,
      );
    } else {
      linesRef.current.updateLines(data);
      linesRef.current.data = data;
      attributesRef.current.updateHoverAttributes(
        [brushRef.current.xScale(keyOfDimension), 1],
        true,
      );
      brushRef.current.domainsData[keyOfDimension] =
        dimensions[keyOfDimension].domainData;
    }
  }

  function handleBrushStart(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    event?.sourceEvent?.stopPropagation();
  }

  const brushHeight = plotBoxRef.current.height;
  plotNodeRef.current
    .selectAll('.Axis')
    .append('g')
    .each(function (this: any, keyOfDimension: string) {
      d3.select(this).call(
        d3
          .brushY()
          .extent([
            [-10, 0],
            [10, brushHeight],
          ])
          .on('start', handleBrushStart)
          .on('brush', (event) => handleBrushChange(event, keyOfDimension))
          .on('end', (event) => handleBrushChange(event, keyOfDimension)),
      );
    })
    .selectAll('rect')
    .attr('x', -10)
    .attr('width', 20);
}

function scalePointDomainData(
  yScale: IGetAxesScale['yScale'],
  extent: number[],
): string[] {
  const domain: string[] = yScale.domain();
  const resultDomainData: string[] = [];
  domain.forEach((item: string) => {
    const yPosOfDomain = yScale(item);
    if (yPosOfDomain >= extent[0] && yPosOfDomain <= extent[1]) {
      resultDomainData.push(item);
    }
  });

  return resultDomainData;
}

function filterDataByBrushedScale({
  line,
  domainsData,
  dimensions,
}: IFilterDataByBrushedScaleProps) {
  const keysOfDimension: string[] = Object.keys(dimensions);
  const { values } = line;
  for (let i = 0; i < keysOfDimension.length; i++) {
    const keyOfDimension = keysOfDimension[i];
    const value: string | number | null = values[keyOfDimension];
    const domainData: Array<string | number> = domainsData[keyOfDimension];
    const { scaleType } = dimensions[keyOfDimension];
    if (
      value !== null &&
      ((scaleType === 'point' && !domainData.includes(value)) ||
        (scaleType !== 'point' &&
          (domainData[0] >= value || domainData[1] <= value)))
    ) {
      return false;
    }
  }

  return true;
}

export default drawParallelAxesBrush;
