import React from 'react';

const Runs = React.lazy(() => import('pages/Runs/Runs'));
const Metrics = React.lazy(() => import('pages/Metrics/MetricsContainer'));
const Params = React.lazy(() => import('pages/Params/ParamsContainer'));
const Bookmarks = React.lazy(
  () => import('pages/Bookmarks/BookmarksContainer'),
);

const PATHS = {
  RUNS: '/runs',
  METRICS: '/metrics',
  METRICS_ID: '/metrics/:appId',
  PARAMS: '/params',
  TAGS: '/tags',
  BOOKMARKS: '/bookmarks',
};

const routes = {
  RUNS: {
    path: PATHS.RUNS,
    component: Runs,
    showInSidebar: true,
    displayName: 'Runs',
  },
  METRICS: {
    path: PATHS.METRICS,
    component: Metrics,
    showInSidebar: true,
    displayName: 'Metrics',
  },
  METRICS_ID: {
    path: PATHS.METRICS_ID,
    component: Metrics,
    showInSidebar: false,
    displayName: 'MetricsId',
  },
  PARAMS: {
    path: PATHS.PARAMS,
    component: Params,
    showInSidebar: true,
    displayName: 'Params',
  },
  BOOKMARKS: {
    path: PATHS.BOOKMARKS,
    component: Bookmarks,
    showInSidebar: true,
    displayName: 'Bookmarks',
  },
};

export { PATHS, routes };
