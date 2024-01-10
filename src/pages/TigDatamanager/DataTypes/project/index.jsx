import React from 'react'
import MapPage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/DataManager/DataTypes/gis_dataset/pages/Table";
import ProjectHoverComp from './MapHoverComp'
import ProjectMapFilter from './MapFilterComp'
import ProjectTableFilter, { ProjectTableTransform } from './TableFilterComp'

import TigOverview from '../TigOverview'
import TigMetadata from '../TigMetadata'

const getVariables = (source,views,activeViewId) =>  {
    
    let currentView = (views || []).filter(d => d.view_id === +activeViewId)?.[0] || views?.[0]
    return views.map(d => ({key: d.view_id, name: d.version || d.view_id , type: 'view'}))
}

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
    component: TigMetadata,
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
        TableFilter={ProjectTableFilter}
        transform={ProjectTableTransform}
      />
    ),
  },
  // This key is used to filter in src/pages/DataManager/Source/create.js
  sourceCreate: {
    name: "Create",
    component: (props) => (
      <CreatePage
        {...props}
        tippecanoeOptions={{flags: ['-b0']}}
        defaultTilesColumns={['ptype']}
      />
    )
  },
  
};

export default GisDatasetConfig;
