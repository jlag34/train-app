import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './components/app';
import Home from './components/home';

const componentRoutes = {
  component: App,
  path: '/',
  indexRoute: { component: Home }
};

const Routes = () => {
  return <Router history={ browserHistory } routes={ componentRoutes } />
};

export default Routes;