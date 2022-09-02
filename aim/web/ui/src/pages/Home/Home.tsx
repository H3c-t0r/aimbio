import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import ExperimentsCard from 'pages/Home/components/ExperimentsCard/ExperimentsCard';

import { IHomeProps } from 'types/pages/home/Home';

import ExploreAim from './components/ExploreAim/ExploreAim';
import SetupGuide from './components/SetupGuide/SetupGuide';
import Activity from './components/Activity/Activity';

import './Home.scss';

function Home({
  activityData,
  onSendEmail,
  notifyData,
  onNotificationDelete,
  askEmailSent,
  experimentsData,
}: IHomeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <section className='Home'>
        <div className='Home__left'></div>
        <div className='Home__middle'>
          <div className='Home__Activity__container'>
            <Activity activityData={activityData} />
          </div>
          <div>
            <ExperimentsCard />
          </div>
          <div className='Home__Explore__container'>
            <SetupGuide askEmailSent={askEmailSent} onSendEmail={onSendEmail} />
            <ExploreAim />
          </div>
        </div>
        <div className='Home__right'></div>
        {notifyData?.length > 0 && (
          <NotificationContainer
            handleClose={onNotificationDelete}
            data={notifyData}
          />
        )}
      </section>
    </ErrorBoundary>
  );
}
export default Home;
