import React from 'react';

import { IAttributesRef } from 'components/LineChart/LineChart';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IAggregationConfig,
  IAlignmentConfig,
} from 'types/services/models/metrics/metricsAppModel';

import { IAxisScale } from './getAxisScale';
import { IProcessedData } from './processData';

export interface IDrawHoverAttributesArgs {
  index: number;
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<IAttributesRef>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  xAxisLabelNodeRef?: React.MutableRefObject<>;
  yAxisLabelNodeRef?: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  syncHoverState: (params: ISyncHoverStateParams) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
  aggregationConfig?: IAggregationConfig;
  alignmentConfig?: IAlignmentConfig;
  humanizerConfigRef: React.MutableRefObject<{}>;
  drawAxisLines?: { x: Boolean; y: Boolean };
  drawAxisLabels?: { x: Boolean; y: Boolean };
}

export interface ISyncHoverStateArgs {
  activePoint: IActivePoint | null;
  dataSelector?: string;
  focusedStateActive?: boolean;
}

export type IAxisLineData = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinates {
  mouseX: number;
  mouseY: number;
}

export interface IGetCoordinatesArgs {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IAxisScale;
  yScale: IAxisScale;
}

export interface INearestCircle {
  x: number;
  y: number;
  key: string;
  color: string;
}

export interface IActivePoint {
  key: string;
  xValue: number | string;
  yValue: number;
  xPos: number;
  yPos: number;
  chartIndex: number;
  topPos: number;
  leftPos: number;
}
