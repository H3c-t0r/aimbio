import React from 'react';
import {
  BlurCircular,
  BlurOn,
  CenterFocusWeak,
  GroupWorkOutlined,
  KeyboardArrowLeft,
  MultilineChart,
  ScatterPlot,
  ShowChart,
  ZoomIn,
  ZoomOut,
} from '@material-ui/icons';

import AggregationPopup from 'components/AggregationPopover/AggregationPopover';
import SmootheningPopup from 'components/SmoothingPopover/SmoothingPopover';
import StepsDensityPopup from 'components/StepsDensityPopover/StepsDensityPopover';
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';

import { IControlProps } from 'types/pages/metrics/components/controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Controls__container'>
      <div onClick={props.onDisplayOutliersChange}>
        {props.displayOutliers ? (
          <BlurOn className='Controls__anchor' />
        ) : (
          <BlurCircular color='primary' className='Controls__anchor' />
        )}
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <ShowChart />
            </div>
          )}
          component={
            <AxesScalePopover
              axesScaleType={props.axesScaleType}
              onAxesScaleTypeChange={props.onAxesScaleTypeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div className='Controls__anchor'>
              <span
                className={`Controls__anchor__arrow ${opened ? 'opened' : ''}`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <GroupWorkOutlined
                color={
                  props.aggregationConfig?.isApplied ? 'primary' : 'inherit'
                }
                onClick={() =>
                  props.onAggregationConfigChange({
                    isApplied: !props.aggregationConfig?.isApplied,
                  })
                }
              />
            </div>
          )}
          component={
            <AggregationPopup
              aggregationConfig={props.aggregationConfig}
              onChange={props.onAggregationConfigChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <ScatterPlot />
            </div>
          )}
          component={<StepsDensityPopup />}
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <MultilineChart />
            </div>
          )}
          component={
            <SmootheningPopup
              onSmoothingChange={props.onSmoothingChange}
              smoothingAlgorithm={props.smoothingAlgorithm}
              curveInterpolation={props.curveInterpolation}
              smoothingFactor={props.smoothingFactor}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div className='Controls__anchor' onClick={onAnchorClick}>
              <CenterFocusWeak />
            </div>
          )}
          component={
            <HighlightModePopup
              mode={props.highlightMode}
              onChange={props.onHighlightModeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div className='Controls__anchor'>
              <span
                className={`Controls__anchor__arrow ${
                  opened ? 'Controls__anchor__arrow__opened' : ''
                }`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomIn
                color={props.zoomMode ? 'primary' : 'inherit'}
                onClick={props.onZoomModeChange}
              />
            </div>
          )}
          component={<ZoomInPopup />}
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div className='Controls__anchor'>
              <span
                className={`Controls__anchor__arrow ${
                  opened ? 'Controls__anchor__arrow__opened' : ''
                }`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomOut onClick={props.onZoomModeChange} />
            </div>
          )}
          component={<ZoomOutPopup />}
        />
      </div>
    </div>
  );
}

export default Controls;
