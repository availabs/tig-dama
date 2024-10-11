import React,  {useMemo} from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import DefaultRoutes from './Routes';
import Layout from './layout/tig-layout'
import LayoutWrapper from './layout/LayoutWrapper'

import get from 'lodash/get'
import {/*getDomain,*/getSubdomain} from './utils'

// import 
//   Messages
//  from "~/modules/avl-components/src/messages"

import tig from './sites/tig'


const App = (props) => {
  

  const WrappedRoutes =  useMemo(() => {
    const Routes = [...tig.Routes, ...DefaultRoutes]
    return LayoutWrapper(Routes, Layout)
  }, [])

  return (
    <>
      <RouterProvider 
        router={createBrowserRouter(WrappedRoutes)} 
      />
      {/*<Messages />*/}
    </>
  )

  
}

export default App;

