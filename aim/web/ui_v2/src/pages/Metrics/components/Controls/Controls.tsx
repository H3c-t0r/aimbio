import React from 'react';

import AggregationPopup from 'components/AggregationPopover/AggregationPopover';
import SmootheningPopup from 'components/SmoothingPopover/SmoothingPopover';
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IControlProps } from 'types/pages/metrics/components/controls/Controls';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';
import AlignmentPopover from 'components/AlignmentPopover/AlignmentPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import Icon from 'components/Icon/Icon';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <ControlPopover
          title='Select Aggregation Method'
          anchor={({ onAnchorClick, opened }) => (
            <div
              onClick={() => {
                if (props.aggregationConfig.isEnabled) {
                  props.onAggregationConfigChange({
                    isApplied: !props.aggregationConfig?.isApplied,
                  });
                }
              }}
              className={`Controls__anchor ${
                props.aggregationConfig.isApplied ? 'active outlined' : ''
              }`}
            >
              {props.aggregationConfig.isEnabled && (
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow__opened' : ''
                  }`}
                >
                  <Icon name='arrow-left' onClick={onAnchorClick} />
                </span>
              )}
              <Icon
                className={`Controls__icon ${
                  props.aggregationConfig.isApplied ? 'active' : ''
                }`}
                name='aggregation'
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
          title='Align X-Axis by'
          anchor={({ onAnchorClick, opened }) => (
            <div
              onClick={onAnchorClick}
              className={`Controls__anchor ${opened ? 'active' : ''}`}
            >
              <Icon
                className={`Controls__icon ${opened ? 'active' : ''}`}
                name='x-axis'
              />
            </div>
          )}
          component={
            <AlignmentPopover
              projectsDataMetrics={props.projectsDataMetrics}
              alignmentConfig={props.alignmentConfig}
              onAlignmentMetricChange={props.onAlignmentMetricChange}
              onAlignmentTypeChange={props.onAlignmentTypeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          title='Axes Scale'
          anchor={({ onAnchorClick, opened }) => (
            <div
              onClick={onAnchorClick}
              className={`Controls__anchor ${opened ? 'active' : ''}`}
            >
              <Icon
                className={`Controls__icon ${opened ? 'active' : ''}`}
                name='axes-scale'
              />
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
          title='Chart Smoothing Options'
          anchor={({ onAnchorClick, opened }) => (
            <div
              onClick={onAnchorClick}
              className={`Controls__anchor ${opened ? 'active' : ''}`}
            >
              <Icon
                className={`Controls__icon ${opened ? 'active' : ''}`}
                name='smoothing'
              />
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
      <div
        className={`Controls__anchor ${
          props.displayOutliers ? 'active outlined' : ''
        }`}
        onClick={props.onDisplayOutliersChange}
      >
        {props.displayOutliers ? (
          <Icon
            className={`Controls__icon ${
              props.displayOutliers ? 'active' : ''
            }`}
            name='ignore-outliers'
          />
        ) : (
          <Icon className='Controls__icon' name='ignore-outliers' />
        )}
      </div>
      <div>
        <ControlPopover
          title='Highlight Modes'
          anchor={({ onAnchorClick, opened }) => (
            <div
              className={`Controls__anchor ${opened ? 'active' : ''}`}
              onClick={onAnchorClick}
            >
              <Icon
                className={`Controls__icon ${opened ? 'active' : ''}`}
                name='highlight-mode'
              />
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
          title='Select Tooltip Params:'
          anchor={({ onAnchorClick, opened }) => (
            <div
              onClick={onAnchorClick}
              className={`Controls__anchor ${opened ? 'active' : ''}`}
            >
              {/*TODO need to change icon */}
              <Icon
                className={`Controls__icon ${opened ? 'active' : ''}`}
                name='cursor'
              />
            </div>
          )}
          component={
            <TooltipContentPopover
              selectOptions={props.selectOptions}
              selectedParams={props.tooltip.selectedParams}
              displayTooltip={props.tooltip.display}
              onChangeTooltip={props.onChangeTooltip}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div
              className={`Controls__anchor ${props.zoomMode ? 'active' : ''}`}
            >
              <span
                className={`Controls__anchor__arrow ${
                  opened ? 'Controls__anchor__arrow__opened' : ''
                }`}
                onClick={onAnchorClick}
              >
                <Icon name='arrow-left' />
              </span>
              <span onClick={props.onZoomModeChange}>
                <Icon
                  className={`Controls__icon ${props.zoomMode ? 'active' : ''}`}
                  name='zoom-in'
                />
              </span>
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
              >
                <Icon name='arrow-left' onClick={onAnchorClick} />
              </span>
              <span onClick={props.onZoomModeChange}>
                <Icon className='Controls__icon' name='zoom-out' />
              </span>
            </div>
          )}
          component={<ZoomOutPopup />}
        />
      </div>
    </div>
  );
}

export default Controls;
