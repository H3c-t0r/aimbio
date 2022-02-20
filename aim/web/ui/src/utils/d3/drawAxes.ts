import * as d3 from 'd3';
import _ from 'lodash-es';
import { Unit } from 'humanize-duration';
import moment from 'moment';

import { IDrawAxesArgs } from 'types/utils/d3/drawAxes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';

import { AlignmentOptionsEnum } from './index';

function drawAxes(args: IDrawAxesArgs): void {
  const {
    svgNodeRef,
    axesNodeRef,
    axesRef,
    plotBoxRef,
    xScale,
    yScale,
    width,
    height,
    margin,
    alignmentConfig,
    humanizerConfigRef,
    drawBgTickLines = {
      x: false,
      y: false,
    },
  } = args;

  if (!axesNodeRef?.current || !axesRef?.current || !svgNodeRef?.current) {
    return;
  }

  function getFormattedXAxis(xScale: d3.AxisScale<d3.AxisDomain>) {
    let xAxis = d3.axisBottom(xScale);
    let xAlignmentText = '';
    const domainData = xScale.domain();
    const first: any = domainData[0];
    const last: any = domainData[domainData.length - 1];

    let ticksCount = Math.floor(plotBoxRef.current.width / 90);
    ticksCount = ticksCount > 3 ? (ticksCount < 10 ? ticksCount : 10) : 3;
    xAxis.ticks(ticksCount);
    if (domainData.length - 1 > ticksCount) {
      const tickValues = domainData.filter(
        (v, i, arr) => i % Math.ceil((arr.length - 1) / ticksCount) === 0,
      );
      xAxis.tickValues(tickValues);
    }

    xAxis.tickFormat((d: any) =>
      _.truncate(`${d}`, { length: 15 + 3 /* dots */ }),
    );

    const alignmentKey = _.capitalize(getKeyByAlignment(alignmentConfig));
    switch (alignmentConfig?.type) {
      case AlignmentOptionsEnum.STEP:
        xAlignmentText = alignmentKey ? alignmentKey + 's' : 'Steps';

        ticksCount = Math.floor(plotBoxRef.current.width / 90);
        ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
        xAxis.ticks(ticksCount);
        break;
      case AlignmentOptionsEnum.EPOCH:
        {
          xAlignmentText = alignmentKey ? alignmentKey + 's' : '';

          ticksCount = Math.floor(plotBoxRef.current.width / 50);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;

          const tickValues = xScale.domain().filter((x) => {
            if (typeof x === 'number') {
              return Math.round(x) - x === 0;
            }
            return true;
          });

          xAxis.ticks(ticksCount).tickValues(tickValues);
        }
        break;
      case AlignmentOptionsEnum.RELATIVE_TIME:
        {
          xAlignmentText = alignmentKey || '';

          ticksCount = Math.floor(plotBoxRef.current.width / 85);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
          const minute = 60;
          const hour = 60 * minute;
          const day = 24 * hour;
          const week = 7 * day;

          const diff = Math.ceil((last - first) / 1000);
          let unit: number | null = null;
          let formatUnit: Unit;
          if (diff / week > 4) {
            unit = week;
            formatUnit = 'w';
          } else if (diff / day > 3) {
            unit = day;
            formatUnit = 'd';
          } else if (diff / hour > 3) {
            unit = hour;
            formatUnit = 'h';
          } else if (diff / minute > 4) {
            unit = minute;
            formatUnit = 'm';
          } else {
            unit = null;
            formatUnit = 's';
          }

          let tickValues: null | number[] = unit === null ? null : [];

          if (tickValues !== null) {
            const d = Math.floor((last - first) / (ticksCount - 1));
            for (let i = 0; i < ticksCount; i++) {
              if (i === ticksCount - 1) {
                tickValues.push(Math.ceil(last + 1));
              } else {
                tickValues.push(Math.floor(first + i * d));
              }
            }
          }

          if (unit !== null && tickValues && ticksCount < tickValues.length) {
            tickValues = tickValues.filter((v, i) => {
              if (i === 0 || i === tickValues!.length - 1) {
                return true;
              }
              const interval = Math.floor(
                (tickValues!.length - 2) / (ticksCount - 2),
              );
              return i % interval === 0 && tickValues!.length - interval > i;
            });
          }

          humanizerConfigRef.current = {
            units: [formatUnit],
            maxDecimalPoints: 2,
          };

          xAxis
            .ticks(ticksCount)
            .tickValues(tickValues!)
            .tickFormat((d, i) => {
              const humanized = shortEnglishHumanizer(
                Math.round(+d),
                humanizerConfigRef.current,
              );
              return _.truncate(humanized, { length: 10 + 3 /* dots */ });
            });
        }
        break;
      case AlignmentOptionsEnum.ABSOLUTE_TIME:
        {
          xAlignmentText = alignmentKey || '';

          ticksCount = Math.floor(plotBoxRef.current.width / 120);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
          let tickValues: number[] = [];
          const d = (last - first) / (ticksCount - 1);
          for (let i = 0; i < ticksCount; i++) {
            if (i === ticksCount - 1) {
              tickValues.push(Math.ceil(last));
            } else {
              tickValues.push(Math.floor(first + i * d));
            }
          }

          xAxis
            .ticks(ticksCount)
            .tickValues(
              tickValues.filter((v, i) => {
                if (i === 0 || i === tickValues.length - 1) {
                  return true;
                }
                const interval = Math.floor(
                  (tickValues.length - 2) / (ticksCount - 2),
                );
                return i % interval === 0 && tickValues.length - interval > i;
              }),
            )
            .tickFormat((d) => {
              const formattedTime = moment(+d).format('HH:mm:ss D MMM, YY');
              return _.truncate(formattedTime, { length: 20 + 3 /* dots */ });
            });
        }
        break;
      case AlignmentOptionsEnum.CUSTOM_METRIC:
        xAlignmentText = alignmentConfig?.metric || '';
        ticksCount = Math.floor(plotBoxRef.current.width / 120);
        ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
        xAxis.ticks(ticksCount);
        break;
    }

    xAxis.tickSizeInner(0);
    if (drawBgTickLines.x) {
      xAxis.tickSize(-height + (margin.top + margin.bottom)).tickSizeOuter(0);
    }
    xAxis.tickPadding(8);
    return { xAlignmentText, xAxis };
  }

  function getFormattedYAxis(yScale: d3.AxisScale<d3.AxisDomain>) {
    const yAxis = d3.axisLeft(yScale);
    let ticksCount = Math.floor(plotBoxRef.current.height / 50);
    ticksCount = ticksCount > 3 ? (ticksCount < 20 ? ticksCount : 20) : 3;
    yAxis.ticks(ticksCount);
    if (yScale.domain().length > ticksCount) {
      const ticks = yScale
        .domain()
        .filter((v, i, arr) => i % Math.ceil(arr.length / ticksCount) === 0);

      yAxis.tickValues(ticks);
    }

    yAxis.tickSizeInner(0);
    if (drawBgTickLines.y) {
      yAxis.tickSize(-width + (margin.left + margin.right)).tickSizeOuter(0);
    }
    yAxis.tickFormat((d: any) =>
      _.truncate(`${d}`, { length: 8 + 3 /* dots */ }),
    );
    yAxis.tickPadding(8);
    return yAxis;
  }

  function drawYAxis(yScale: IAxisScale): void {
    axesNodeRef.current?.select('.yAxis')?.remove();

    const yAxis = getFormattedYAxis(yScale);

    axesRef.current.yAxis = axesNodeRef.current
      ?.append('g')
      .attr('class', 'yAxis')
      .attr('stroke-width', 0.2)
      .attr('color', '#414b6d')
      .attr('fill', 'none')
      .call(yAxis);

    axesRef.current.yAxis
      .select('.domain')
      .attr('stroke', '#414b6d')
      .attr('stroke-width', 0.4);

    axesRef.current.yAxis
      .selectAll('.tick')
      .append('svg:title')
      .text((d: string | number) => d);

    axesRef.current.yAxis
      .selectAll('.tick line')
      .attr('stroke', '#8E9BAE')
      .attr('x1', '-6');
  }

  function drawXAxis(xScale: IAxisScale): void {
    axesNodeRef.current?.select('.xAxis')?.remove();

    const { xAlignmentText, xAxis } = getFormattedXAxis(xScale);

    axesRef.current.xAxis = axesNodeRef.current
      ?.append('g')
      .attr('class', 'xAxis')
      .attr('stroke-width', 0.2)
      .attr('color', '#414b6d')
      .attr('fill', 'none')
      .attr('transform', `translate(0, ${plotBoxRef.current.height})`)
      .call(xAxis);

    axesRef.current.xAxis
      .select('.domain')
      .attr('stroke', '#414b6d')
      .attr('stroke-width', 0.4);

    axesRef.current.xAxis
      .selectAll('.tick')
      .append('svg:title')
      .text((d: number) => {
        return formatValueByAlignment({
          xAxisTickValue: d ?? null,
          type: alignmentConfig?.type,
        });
      });

    axesRef.current.xAxis
      .selectAll('.tick line')
      .attr('stroke', '#8E9BAE')
      .attr('y1', '6');

    axesRef.current.xAxis
      .append('text')
      .attr(
        'transform',
        `translate(${width - margin.left - margin.right - 20},-5)`,
      )
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'ideographic')
      .style('font-size', '1.1em')
      .style('fill', '#586069')
      .text(xAlignmentText);
  }

  drawYAxis(yScale);
  drawXAxis(xScale);

  axesRef.current.updateXAxis = function (
    xScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    drawXAxis(xScaleUpdate);
  };

  axesRef.current.updateYAxis = function (
    yScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    drawYAxis(yScaleUpdate);
  };
}

export default drawAxes;
