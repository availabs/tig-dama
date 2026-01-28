import React, { useEffect, useState } from "react";

import Map from "~/pages/TigDatamanager/Utils/gisMap";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/TigDatamanager/Utils/gisTable";
import TigOverview from '../TigOverview'
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import {BPMTableTransform, HBTableFilter} from './BPMTableFilter'
import {BPMMapFilter} from './BPMMapFilter'
import {BPMHoverComp} from './BPMHoverComp'
import Admin from "../default/Admin"
import mapStyleConfig from "~/config.json"

import {BPMChartFilters, BPMChartTransform } from './BPMChartFilters'

import Chart from './BPMChart'


const getVariables = (source,views,activeViewId) =>  {
    let currentView = (views || []).filter(d => d.view_id === +activeViewId)?.[0] || views?.[0]
    return views.map(d => ({key: d.view_id, name: d.version || d.view_id , type: 'view'}))
}


const config = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview 
        {...props}
        getVariables={getVariables}  
        filterButtons={[]}
      />
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: Overview,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        striped={true}
        showViewSelector={true}
        transform={BPMTableTransform}
        TableFilter={HBTableFilter}
      />
    ),
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => (
      <Map
        {...props}
         showViewSelector={true}
         MapFilter={BPMMapFilter}
         HoverComp={{Component: BPMHoverComp, isPinnable: true}}
         displayPinnedGeomBorder={true}
         mapStyles={[mapStyleConfig?.google_streets_style]}
         dataColumns={['geoid']}
      />
    ),
  },
  chart: {
    name: "Chart",
    path: "/chart",
    component: (props) => (
      <Chart
        {...props}
        ChartFilter={BPMChartFilters}
        transform={BPMChartTransform}
      />
    ),
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
