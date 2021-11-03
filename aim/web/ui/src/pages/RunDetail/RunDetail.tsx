import React, { memo, useRef, useState } from 'react';
import moment from 'moment';
import { Link, NavLink, useParams } from 'react-router-dom';
import classNames from 'classnames';

import { Paper, Popover, Tab, Tabs } from '@material-ui/core';

import TabPanel from 'components/TabPanel/TabPanel';
import { Badge, Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import StatusLabel from 'components/StatusLabel';

import useModel from 'hooks/model/useModel';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { processDurationTime } from 'utils/processDurationTime';

import RunDetailSettingsTab from './RunDetailSettingsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailParamsTab from './RunDetailParamsTab';
import RunSelectPopoverContent from './RunSelectPopoverContent';

import './RunDetail.scss';

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  let runsOfExperimentRequestRef: any = null;
  const runData = useModel(runDetailAppModel);
  const containerRef = useRef<any>(null);
  const [value, setValue] = useState(0);
  const [isRunSelectDropdownOpen, setIsRunSelectDropdownOpen] = useState(false);
  const { runHash } = useParams<{ runHash: string }>();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  function onRunsSelectToggle() {
    setIsRunSelectDropdownOpen(!isRunSelectDropdownOpen);
  }

  React.useEffect(() => {
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    const experimentRequestRef = runDetailAppModel.getExperimentsData();
    runsRequestRef
      .call()
      .then((data) => getRunsOfExperiment(data.props.experiment.id));
    experimentRequestRef.call();
    return () => {
      runsRequestRef.abort();
      experimentRequestRef.abort();
      runsOfExperimentRequestRef?.abort();
    };
  }, [runHash]);

  function getRunsOfExperiment(id: string, params?: any) {
    runsOfExperimentRequestRef = runDetailAppModel.getRunsOfExperiment(
      id,
      params,
    );
    runsOfExperimentRequestRef.call();
  }

  React.useEffect(() => {
    analytics.pageView('[RunDetail]');
  }, []);

  return (
    <section className='RunDetail container' ref={containerRef}>
      <div className='RunDetail__runDetailContainer'>
        <div className='RunDetail__runDetailContainer__appBarContainer'>
          <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox'>
            <div className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__container'>
              <Text tint={100} size={16} weight={600}>
                {`Experiment Name / ${runData?.runInfo?.experiment?.name}`}
              </Text>
            </div>
            <Button
              onClick={onRunsSelectToggle}
              disabled={runData?.isExperimentsLoading}
              color={isRunSelectDropdownOpen ? 'primary' : 'default'}
              size='small'
              className='RunDetail__runDetailContainer__appBarContainer__appBarTitleBox__buttonSelectToggler'
              style={
                isRunSelectDropdownOpen
                  ? { background: '#E8F1FC' }
                  : { background: 'transparent' }
              }
              withOnlyIcon
            >
              <Icon name={'arrow-down'} />
            </Button>
          </div>
          <Popover
            // id={id}
            open={isRunSelectDropdownOpen}
            onClose={onRunsSelectToggle}
            // disableEnforceFocus={true}
            anchorReference='anchorPosition'
            anchorPosition={{
              left: containerRef.current?.offsetLeft + 40,
              top: 35,
            }}
            className='RunSelectPopoverWrapper'
          >
            <RunSelectPopoverContent
              getRunsOfExperiment={getRunsOfExperiment}
              experimentsData={runData?.experimentsData}
              experimentId={runData?.experimentId}
              runsOfExperiment={runData?.runsOfExperiment}
              runInfo={runData?.runInfo}
            />
          </Popover>
        </div>
        <div className='RunDetail__runDetailContainer__headerContainer'>
          <div className='RunDetail__runDetailContainer__headerContainer__infoBox'>
            <Text
              component='p'
              tint={100}
              size={14}
              weight={600}
              className='RunDetail__runDetailContainer__headerContainer__infoBox__dateTitle'
            >
              {`${moment(runData?.runInfo?.creation_time * 1000).format(
                'DD MMM YYYY, HH:mm A',
              )} | ${processDurationTime(
                runData?.runInfo?.creation_time * 1000,
                runData?.runInfo?.end_time
                  ? runData?.runInfo?.end_time * 1000
                  : Date.now(),
              )}`}
            </Text>
            <StatusLabel
              status={runData?.runInfo?.end_time ? 'alert' : 'success'}
              title={runData?.runInfo?.end_time ? 'Finished' : 'In Progress'}
            />
          </div>
          <div className='RunDetail__runDetailContainer__headerContainer__tagsBox ScrollBar__hidden'>
            {runData?.runInfo?.tags.map((tag: any, i: number) => (
              <Badge color={tag.color} label={tag.name} key={i} />
            ))}
          </div>
        </div>
        <Paper className='RunDetail__runDetailContainer__tabsContainer'>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label='simple tabs example'
            indicatorColor='primary'
            textColor='primary'
          >
            <Tab label='Parameters' />
            <Tab label='Metrics' />
            <Tab label='System' />
            <Tab label='Settings' />
          </Tabs>
        </Paper>
        <TabPanel
          value={value}
          index={0}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailParamsTab
            runParams={runData?.runParams}
            isRunInfoLoading={runData?.isRunInfoLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={1}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailMetricsAndSystemTab
            runHash={runHash}
            runTraces={runData?.runTraces}
            runBatch={runData?.runMetricsBatch}
            isRunBatchLoading={runData?.isRunBatchLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={2}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailMetricsAndSystemTab
            runHash={runHash}
            runTraces={runData?.runTraces}
            runBatch={runData?.runSystemBatch}
            isSystem
            isRunBatchLoading={runData?.isRunBatchLoading}
          />
        </TabPanel>
        <TabPanel
          value={value}
          index={3}
          className='RunDetail__runDetailContainer__tabPanel'
        >
          <RunDetailSettingsTab
            isArchived={runData?.runInfo?.archived}
            runHash={runHash}
          />
        </TabPanel>
      </div>
      {runData?.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={runDetailAppModel?.onNotificationDelete}
          data={runData?.notifyData}
        />
      )}
    </section>
  );
}

export default memo(RunDetail);
