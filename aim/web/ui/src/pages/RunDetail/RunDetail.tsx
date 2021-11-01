import React, { memo, useState } from 'react';
import moment from 'moment';
import { NavLink, useParams } from 'react-router-dom';

import { Paper, Tab, Tabs } from '@material-ui/core';

import TabPanel from 'components/TabPanel/TabPanel';
import AppBar from 'components/AppBar/AppBar';
import { Badge, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import useModel from 'hooks/model/useModel';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import * as analytics from 'services/analytics';

import { processDurationTime } from 'utils/processDurationTime';

import RunDetailParamsTab from './RunDetailParamsTab';
import RunDetailMetricsAndSystemTab from './RunDetailMetricsAndSystemTab';
import RunDetailSettingsTab from './RunDetailSettingsTab';

import './RunDetail.scss';

function RunDetail(): React.FunctionComponentElement<React.ReactNode> {
  const runData = useModel(runDetailAppModel);
  const [value, setValue] = useState(0);
  const { runHash } = useParams<{ runHash: string }>();
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    runDetailAppModel.initialize();
    const runsRequestRef = runDetailAppModel.getRunInfo(runHash);
    runsRequestRef.call();
    return () => {
      runsRequestRef.abort();
    };
  }, [runHash]);

  React.useEffect(() => {
    analytics.pageView('[RunDetail]');
  }, []);

  return (
    <section className='RunDetail container'>
      <div className='RunDetail__runDetailContainer'>
        <AppBar
          title={
            <div className='RunDetail__runDetailContainer__appBarTitleBox'>
              <NavLink
                className='RunDetail__runDetailContainer__appBarTitleBox__pageName'
                to='/runs'
              >
                <Text tint={70} size={16} weight={600}>
                  Runs
                </Text>
              </NavLink>
              /
              <Text
                className='RunDetail__runDetailContainer__appBarTitleBox__runHash'
                size={16}
                tint={100}
                weight={600}
              >
                {runHash}
              </Text>
            </div>
          }
        />
        <div className='RunDetail__runDetailContainer__headerContainer'>
          <div className='RunDetail__runDetailContainer__headerContainer__infoBox'>
            <Text component='p' weight={600} size={14} tint={100}>
              Experiment: {runData?.runInfo?.experiment}
            </Text>
            <Text component='p' tint={100}>
              {`${moment(runData?.runInfo?.creation_time * 1000).format(
                'DD MMM YYYY ~ HH:mm A',
              )} ~ ${
                !runData?.runInfo?.end_time
                  ? 'in progress'
                  : processDurationTime(
                      runData?.runInfo?.creation_time * 1000,
                      runData?.runInfo?.end_time * 1000,
                    )
              }`}
            </Text>
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
