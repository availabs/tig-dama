import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { API_HOST } from './config'
import { AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from '~/config'

// import { Provider } from 'react-redux';
// import store from '~/store';

import PPDAF_THEME from "./theme"
import {
  FalcorProvider,
  ThemeContext,
  falcorGraph,
} from "~/modules/avl-components/src"

import reportWebVitals from './reportWebVitals';

// import {
//   enableAuth
// } from "@availabs/ams"
import { authProvider } from "~/modules/ams/src" //"./modules/ams/src"

import './index.css';

const AuthEnabledApp = authProvider(App, { AUTH_HOST, PROJECT_NAME, CLIENT_HOST });

export const falcor = falcorGraph(API_HOST);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
		<FalcorProvider falcor={ falcor }>
      <ThemeContext.Provider value={PPDAF_THEME}>
        <AuthEnabledApp />
      </ThemeContext.Provider>
    </FalcorProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
