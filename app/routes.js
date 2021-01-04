import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import Dashboard from "./containers/Dashboard";
import { createBrowserHistory } from "history";
import { Footer } from "antd/lib/layout/layout";

const history = createBrowserHistory();

export default function routes() {
  return (
    <Router  history={history}>
      <React.Fragment>
        <Switch>
          <Route exact path="/" component={Dashboard} />
        </Switch>
      </React.Fragment>
    </Router>
  );
}
