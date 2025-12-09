import React from 'react'
import MapPage from "~/pages/TigDatamanager/Utils/gisMap";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/TigDatamanager/Utils/gisTable";
import ProjectHoverComp from './MapHoverComp'
import ProjectMapFilter from './MapFilterComp'
import { ProjectTableTransform } from './TableFilterComp'
import Overview from "~/pages/DataManager/DataTypes/default/Overview";

import TigOverview from '../TigOverview'

import config from "~/config.json"

const getVariables = (source, views, activeViewId) => {
  return views.map((d) => ({
    key: d.view_id,
    name: d.version || d.view_id,
    type: "view",
  }));
};

const GisDatasetConfig = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview 
    {...props} 
    getVariables={getVariables} 
    filterButtons={['Chart']}
    />
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: Overview,
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => (
      <MapPage 
        {...props}
        showViewSelector={true}
        MapFilter={ProjectMapFilter}
        HoverComp={{Component: ProjectHoverComp, isPinnable: true}}
        mapStyles={[config?.google_streets_style]}
        alwaysRedrawLayers={true}
      />
    ),
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        showViewSelector={true}
        transform={ProjectTableTransform}
        fullWidth={true}
        striped={true}
      />
    ),
  },
  // This key is used to filter in src/pages/DataManager/Source/create.js
  sourceCreate: {
    name: "Create",
    component: (props) => (
      <CreatePage
        {...props}
        useMbTiles={true}
        tippecanoeOptions={{flags: ['-b0']}}
        defaultTilesColumns={['ptype']}
      />
    )
  },
  
};

export default GisDatasetConfig;
