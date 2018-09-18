import React from "react";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";

const RouteWithSubRoutes = route => (
  <Switch>
	  <Route
	    path={route.path}
	    exact={route.exact}
	    render={props => (
	      // pass the sub-routes down to keep nesting
	      <route.component {...props} routes={route.routes} />
	    )}
	  />
  </Switch>
);

export default RouteWithSubRoutes