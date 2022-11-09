import React from 'react';
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Paper, Tab, Tabs } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { Spinner } from 'components/kit';

import { setDocumentTitle } from 'utils/document/documentTitle';

import useExperimentState from './useExperimentState';
import ExperimentHeader from './components/ExperimentHeader';

import './Experiment.scss';

const ExperimentOverviewTab = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ExperimentOverviewTab" */ './components/ExperimentOverviewTab'
    ),
);

const tabs: { [key: string]: string } = {
  overview: 'Overview',
  runs: 'Runs',
  notes: 'Notes',
  settings: 'Settings',
};

function Experiment(): React.FunctionComponentElement<React.ReactNode> {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { url } = useRouteMatch();
  const history = useHistory();
  const { experimentState, experimentsState, getExperimentsData } =
    useExperimentState(experimentId);
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = React.useState(pathname);

  const { data: experimentData, loading: isExperimentLoading } =
    experimentState;

  const { data: experimentsData, loading: isExperimentsLoading } =
    experimentsState;

  const tabContent: { [key: string]: JSX.Element } = {
    overview: (
      <ExperimentOverviewTab experimentName={experimentData?.name ?? ''} />
    ),
    runs: <div>runs</div>,
    notes: <div>notes</div>,
    settings: <div>settings</div>,
  };

  function handleTabChange(event: React.ChangeEvent<{}>, newValue: string) {
    setActiveTab(newValue);
  }

  function redirect(): void {
    const splitPathname: string[] = pathname.split('/');
    const path: string = `${url}/overview`;
    if (splitPathname.length > 4) {
      history.replace(path);
      setActiveTab(path);
      return;
    }
    if (splitPathname[3]) {
      if (!Object.keys(tabs).includes(splitPathname[3])) {
        history.replace(path);
      }
    } else {
      history.replace(path);
    }
    setActiveTab(path);
  }

  React.useEffect(() => {
    if (pathname !== activeTab) {
      setActiveTab(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    setDocumentTitle(experimentData?.name || experimentId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentData]);

  React.useEffect(() => {
    redirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <section className='Experiment'>
        <ExperimentHeader
          experimentData={experimentData}
          experimentsData={experimentsData}
          isExperimentLoading={isExperimentLoading}
          isExperimentsLoading={isExperimentsLoading}
          experimentId={experimentId}
          getExperimentsData={getExperimentsData}
        />
        <Paper className='Experiment__tabsContainer'>
          <Tabs
            className='Experiment__tabsContainer__tabs container'
            value={pathname}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
          >
            {Object.keys(tabs).map((tabKey: string) => (
              <Tab
                key={`${url}/${tabKey}`}
                label={tabs[tabKey]}
                value={`${url}/${tabKey}`}
                component={Link}
                to={`${url}/${tabKey}`}
              />
            ))}
          </Tabs>
        </Paper>
        <BusyLoaderWrapper
          isLoading={isExperimentLoading}
          height='calc(100vh - 112px)'
        >
          <Switch>
            {Object.keys(tabs).map((tabKey: string) => (
              <Route path={`${url}/${tabKey}`} key={tabKey}>
                <ErrorBoundary>
                  {tabKey === 'overview' ? (
                    <div className='Experiment__tabPanelBox overviewPanel'>
                      <React.Suspense
                        fallback={
                          <div className='Experiment__tabPanelBox__suspenseLoaderContainer'>
                            <Spinner />
                          </div>
                        }
                      >
                        {tabContent[tabKey]}
                      </React.Suspense>
                    </div>
                  ) : (
                    <div className='Experiment__tabPanelBox'>
                      <div className='Experiment__tabPanel container'>
                        <React.Suspense
                          fallback={
                            <div className='Experiment__tabPanelBox__suspenseLoaderContainer'>
                              <Spinner />
                            </div>
                          }
                        >
                          {tabContent[tabKey]}
                        </React.Suspense>
                      </div>
                    </div>
                  )}
                </ErrorBoundary>
              </Route>
            ))}
          </Switch>
        </BusyLoaderWrapper>
      </section>
    </ErrorBoundary>
  );
}
export default React.memo(Experiment);
