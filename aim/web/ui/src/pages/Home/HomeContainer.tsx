import React from 'react';

import Home from './Home';
import homeAppModel from 'services/models/home/homeAppModel';
import useModel from 'hooks/model/useModel';

function HomeContainer(): React.FunctionComponentElement<React.ReactNode> {
  const activityRequestRef = React.useRef(homeAppModel.getActivityData());
  const homeData = useModel(homeAppModel);

  React.useEffect(() => {
    homeAppModel.initialize();
    activityRequestRef.current.call();
    return () => {
      activityRequestRef.current.abort();
    };
  }, []);

  return (
    <Home
      onSendEmail={homeAppModel.onSendEmail}
      activityData={homeData.activityData}
      notifyData={homeData.notifyData}
      askEmailSent={homeData.askEmailSent}
      onNotificationDelete={homeAppModel.onNotificationDelete}
    />
  );
}
export default HomeContainer;
