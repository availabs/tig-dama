import React, { useEffect, useState } from "react";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/TigDatamanager/Utils/gisTable";
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import {UPWPTableTransform, HBTableFilter} from './TableFilters.jsx'
import Admin from "../default/Admin"

import TigOverview from '../TigOverview'

const getVariables = (source,views,activeViewId) =>  {
    
    let currentView = (views || []).filter(d => d.view_id === +activeViewId)?.[0] || views?.[0]
    return views.map(d => ({key: d.view_id, name: d.version || d.view_id , type: 'view'}))
}

const config = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview {...props} getVariables={getVariables} filterButtons={['Map','Chart']}/>
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        transform={UPWPTableTransform}
        TableFilter={HBTableFilter}
        fullWidth={true}
      />
    ),
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: Overview,
  },
  sourceCreate: {
    name: "Create",
    component: CreatePage
  },
  admin: {
    name: "Admin",
    path: "/admin",
    authLevel: 10,
    component: Admin
  }
  
};

export default config
