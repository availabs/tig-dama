import React from 'react';


import { Route, Navigate, useLocation, Outlet } from "react-router";

import Layouts from './components/Layouts'
import LoadingPage from "./components/Loading"
import withTheme from "./wrappers/with-theme"
import { ComponentFactory } from "./ComponentFactory"

import get from "lodash/get"
import layouts from "./components/Layouts";

const DefaultLayout = ({ component, path, exact, layoutSettings, isAuthenticating, layout, key, ...props  }) => {
    const LayoutWrapper = () => {
      const Layout =  typeof layout === 'string' ?
        get(Layouts, layout, Layouts["Fixed"]) :
        layout;

      return <Layout {...layoutSettings} > <Outlet /> </Layout>
    }

  if (isAuthenticating) {
    return (
      <Route key={'loading'} element={ <LayoutWrapper /> }>
        <Route path={ path } exact={ exact } render={() => (
          <div className="fixed top-0 left-0 w-screen h-screen z-50"
               style={ { backgroundColor: "rgba(0, 0, 0, 0.5)" } }>
            <LoadingPage />
          </div>
        )} />
      </Route>
    )
  }

  return (
  sendToLogin(props) ?
    ( <Route path={ "/auth/login" } render={() => {
        // const location = useLocation();
        return <Navigate to={{ pathname: "/auth/login" }} state={{ from: '/'/*get(location, "pathname")*/ }} />;
      }}/>
    ) :
    sendToHome(props) ? <Route path={ "/" } render={() =>  <Navigate to="/"/>} /> :
      (
        <Route key={key} path={path} element={<LayoutWrapper />} >
          <Route path={path} element={<ComponentFactory config={component} />} />
        </Route>
      ))

}

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
