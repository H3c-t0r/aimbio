import React from 'react';
import { Grid } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import SelectForm from './components/SelectForm/SelectForm';
import Grouping from './components/Grouping/Grouping';
import Controls from './components/Controls/Controls';
import AppBar from './components/AppBar/AppBar';
import Table from 'components/Table/Table';
import ChartPanel from 'components/ChartPanel/ChartPanel';

import { IMetricProps } from 'types/pages/metrics/Metrics';
import { ChartTypeEnum } from 'utils/d3';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import './Metrics.scss';

function Metrics(
  props: IMetricProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div ref={props.wrapperElemRef} className='Metrics__container'>
      <section className='Metrics__section'>
        <Grid
          container
          direction='column'
          justifyContent='center'
          className='Metrics__fullHeight'
        >
          <Grid item>
            <AppBar
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
            />
          </Grid>
          <Grid item>
            <div className='Metrics__SelectForm__Grouping__container'>
              <SelectForm
                selectedMetricsData={props.selectedMetricsData}
                onMetricsSelectChange={props.onMetricsSelectChange}
              />
              <Grouping
                groupingData={props.groupingData}
                onGroupingSelectChange={props.onGroupingSelectChange}
                onGroupingModeChange={props.onGroupingModeChange}
                onGroupingPaletteChange={props.onGroupingPaletteChange}
                onGroupingReset={props.onGroupingReset}
                onGroupingApplyChange={props.onGroupingApplyChange}
                onGroupingPersistenceChange={props.onGroupingPersistenceChange}
              />
            </div>
          </Grid>
          <Grid
            ref={props.chartElemRef}
            className='Metrics__chart__container'
            item
          >
            {!!props.lineChartData?.[0]?.length ? (
              <ChartPanel
                ref={props.chartPanelRef}
                chartType={ChartTypeEnum.LineChart}
                data={props.lineChartData as any}
                focusedState={props.focusedState}
                onActivePointChange={props.onActivePointChange}
                tooltipContent={props.tooltipContent}
                aggregatedData={props.aggregatedData}
                aggregationConfig={props.aggregationConfig}
                chartProps={[
                  {
                    axesScaleType: props.axesScaleType,
                    curveInterpolation: props.curveInterpolation,
                    displayOutliers: props.displayOutliers,
                    zoomMode: props.zoomMode,
                    highlightMode: props.highlightMode,
                  },
                ]}
                controls={
                  <Controls
                    smoothingAlgorithm={props.smoothingAlgorithm}
                    smoothingFactor={props.smoothingFactor}
                    curveInterpolation={props.curveInterpolation}
                    displayOutliers={props.displayOutliers}
                    zoomMode={props.zoomMode}
                    highlightMode={props.highlightMode}
                    aggregationConfig={props.aggregationConfig}
                    axesScaleType={props.axesScaleType}
                    alignmentConfig={props.alignmentConfig}
                    onDisplayOutliersChange={props.onDisplayOutliersChange}
                    onZoomModeChange={props.onZoomModeChange}
                    onHighlightModeChange={props.onHighlightModeChange}
                    onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                    onSmoothingChange={props.onSmoothingChange}
                    onAggregationConfigChange={props.onAggregationConfigChange}
                    onAlignmentTypeChange={props.onAlignmentTypeChange}
                    onAlignmentMetricChange={props.onAlignmentMetricChange}
                  />
                }
              />
            ) : null}
          </Grid>
          <div ref={props.resizeElemRef}>
            <div className='Metrics__resize'>
              <MoreHorizIcon />
            </div>
          </div>
          <Grid
            item
            xs
            ref={props.tableElemRef}
            className='Metrics__table__container'
          >
            {props.tableData?.length > 0 ? (
              <Table
                ref={props.tableRef}
                onSort={() => null}
                onExport={() => null}
                data={props.tableData.flat()}
                columns={props.tableColumns}
                onRowHover={props.onTableRowHover}
                onRowClick={props.onTableRowClick}
              />
            ) : null}
          </Grid>
        </Grid>
      </section>
      {props.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={props.onNotificationDelete}
          data={props.notifyData}
        />
      )}
    </div>
  );
}

export default React.memo(Metrics);
