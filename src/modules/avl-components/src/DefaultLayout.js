import React from 'react';


import { Route, Redirect, useLocation } from "react-router-dom";

import Layouts from './components/Layouts'
import LoadingPage from "./components/Loading"
import withTheme from "./wrappers/with-theme"
import { ComponentFactory } from "./ComponentFactory"

import get from "lodash.get"

const DefaultLayout = withTheme(({ component, path, exact, layoutSettings, isAuthenticating, ...props }) => {
  const location = useLocation(),
    Layout = typeof props.layout === 'string' ? 
      get(Layouts, props.layout, Layouts["Fixed"]) :
      props.layout;

  if (isAuthenticating) {
    return (
      <Layout { ...layoutSettings } { ...props }>
        <Route path={ path } exact={ exact }>
          <div className="fixed top-0 left-0 w-screen h-screen z-50"
            style={ { backgroundColor: "rgba(0, 0, 0, 0.5)" } }>
            <LoadingPage />
          </div>
        </Route>
      </Layout>
    )
  }

  return sendToLogin(props) ?
    ( <Redirect
        to={ {
          pathname: "/auth/login",
          state: { from: get(location, "pathname") }
        } }/>
    ) : sendToHome(props) ? <Redirect to="/"/> :
    ( <Layout { ...layoutSettings } { ...props }>
        <Route path={ path } exact={ exact }>
          <ComponentFactory config={ component }/>
        </Route>
      </Layout>
    )
})

const getAuthLevel = props =>
  props.auth ? 0 : get(props, "authLevel", -1);

function sendToLogin(props) {
  const requiresAuth = getAuthLevel(props) > -1;
  return requiresAuth && !get(props, ["user", "authed"], false);
}

function sendToHome(props) {
  return (get(props , ["user", "authLevel"], -1) < getAuthLevel(props));
}

export default DefaultLayout
