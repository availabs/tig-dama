import React, { useEffect, useState } from "react";

import Map from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/DataManager/DataTypes/gis_dataset/pages/Table";
import TigOverview from '../TigOverview'
import TigMetadata from '../TigMetadata'

import {BPMTableTransform, HBTableFilter} from './BPMTableFilter'
import {BPMMapFilter} from './BPMMapFilter'
import {BPMHoverComp} from './BPMHoverComp'


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
    component: TigMetadata,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        showViewSelector={false}
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
         showViewSelector={false}
         MapFilter={BPMMapFilter}
         HoverComp={{Component: BPMHoverComp, isPinnable: true}}
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
  }
  
};

export default config
