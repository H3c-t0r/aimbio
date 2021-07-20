import clearArea from './clearArea';
import drawArea from './drawArea';
import drawAxes from './drawAxes';
import drawLines from './drawLines';
import processData from './processData';
import getAxesScale from './getAxesScale';
import drawBrush from './drawBrush';
import drawHoverAttributes from './drawHoverAttributes';

enum XAlignmentEnum {
  Epoch = 'epoch',
  RelativeTime = 'relative_time',
  AbsoluteTime = 'absolute_time',
}

enum CircleEnum {
  Radius = 3,
  ActiveRadius = 5,
}

enum CurveEnum {
  Linear = 'curveLinear',
  Basis = 'curveBasis',
  Bundle = 'curveBundle',
  Cardinal = 'curveCardinal',
  CatmullRom = 'curveCatmullRom',
  MonotoneX = 'curveMonotoneX',
  MonotoneY = 'curveMonotoneY',
  Natural = 'curveNatural',
  Step = 'curveStep',
  StepAfter = 'curveStepAfter',
  StepBefore = 'curveStepBefore',
  BasisClosed = 'curveBasisClosed',
}

enum ScaleEnum {
  Log = 'log',
  Linear = 'linear',
}

export {
  CircleEnum,
  CurveEnum,
  ScaleEnum,
  XAlignmentEnum,
  clearArea,
  drawArea,
  drawAxes,
  drawLines,
  processData,
  getAxesScale,
  drawBrush,
  drawHoverAttributes,
};
