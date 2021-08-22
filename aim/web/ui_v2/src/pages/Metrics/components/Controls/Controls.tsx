import React from 'react';
import { Box, Grid } from '@material-ui/core';
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
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IControlProps } from 'types/pages/metrics/components/controls/Controls';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';

import './Controls.scss';
import AlignmentPopover from 'components/AlignmentPopover/AlignmentPopover';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Grid
      container
      direction='column'
      justifyContent='center'
      spacing={1}
      alignItems='center'
    >
      <Grid onClick={props.onDisplayOutliersChange} item>
        {props.displayOutliers ? (
          <BlurOn className='Controls__anchor' />
        ) : (
          <BlurCircular color='primary' className='Controls__anchor' />
        )}
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className='Controls__anchor'>
              <ShowChart />
            </Box>
          )}
          component={
            <AxesScalePopover
              axesScaleType={props.axesScaleType}
              onAxesScaleTypeChange={props.onAxesScaleTypeChange}
            />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <Box
              className={`Controls__anchor ${
                props.aggregationConfig.isEnabled ? '' : 'disabled'
              }`}
              position='relative'
            >
              {props.aggregationConfig.isEnabled && (
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow__opened' : ''
                  }`}
                  onClick={onAnchorClick}
                >
                  <KeyboardArrowLeft className='arrowLeft' />
                </span>
              )}
              <GroupWorkOutlined
                color={
                  props.aggregationConfig?.isApplied ? 'primary' : 'inherit'
                }
                onClick={() => {
                  if (props.aggregationConfig.isEnabled) {
                    props.onAggregationConfigChange({
                      isApplied: !props.aggregationConfig?.isApplied,
                    });
                  }
                }}
              />
            </Box>
          )}
          component={
            <AggregationPopup
              aggregationConfig={props.aggregationConfig}
              onChange={props.onAggregationConfigChange}
            />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className='Controls__anchor'>
              <ScatterPlot />
            </Box>
          )}
          component={
            <AlignmentPopover
              alignmentConfig={props.alignmentConfig}
              onAlignmentMetricChange={props.onAlignmentMetricChange}
              onAlignmentTypeChange={props.onAlignmentTypeChange}
            />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className='Controls__anchor'>
              <MultilineChart />
            </Box>
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
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box className='Controls__anchor' onClick={onAnchorClick}>
              <CenterFocusWeak />
            </Box>
          )}
          component={
            <HighlightModePopup
              mode={props.highlightMode}
              onChange={props.onHighlightModeChange}
            />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <Box className='Controls__anchor' position='relative'>
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
            </Box>
          )}
          component={<ZoomInPopup />}
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <Box className='Controls__anchor' position='relative'>
              <span
                className={`Controls__anchor__arrow ${
                  opened ? 'Controls__anchor__arrow__opened' : ''
                }`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomOut onClick={props.onZoomModeChange} />
            </Box>
          )}
          component={<ZoomOutPopup />}
        />
      </Grid>
    </Grid>
  );
}

export default Controls;
