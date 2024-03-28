import React from "react";
import Create from "./create";
import Update from "./update";
import MapPage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import ACSMapFilter from "./map";
import Chart from "./chart";

import { ACSHoverComp } from "./map/hover";
import Table from "./table";
import { AcsTableFilter, AcsTableTransform } from "./table/acsFilters";
import { AcsChartFilters, ACSChartTransform } from "./chart/filters";

import TigOverview from '../TigOverview'
import TigMetadata from '../TigMetadata'

import config from "~/config.json"

const getVariables = (source,views,activeViewId) =>  {
    
    let currentView = (views || []).filter(d => d.view_id === +activeViewId)?.[0] || views?.[0]
    return (currentView?.metadata?.variables || []).map(d => ({key: d.label, name: d.label}))
}

const TigAcsConfig = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview {...props} getVariables={getVariables}/>
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
        showViewSelector={false}
        MapFilter={ACSMapFilter}
        HoverComp={{ Component: ACSHoverComp, isPinnable: true }}
        mapStyles={[config?.google_streets_style]}
      />
    ),
  },
  sourceCreate: {
    name: "Create",
    component: (props) => <Create {...props} dataType="tig_acs" />,
  },
  update: {
    name: "Update",
    path: "/update",
    component: (props) => <Update {...props} />,
  },
  chart: {
    name: "Chart",
    path: "/chart",
    component: (props) => (
      <Chart
        {...props}
        showViewSelector={false}
        ChartFilter={AcsChartFilters}
        transform={ACSChartTransform}
      />
    ),
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        transform={AcsTableTransform}
        TableFilter={AcsTableFilter}
        fullWidth={true}
      />
    ),
  },
};

export default TigAcsConfig;
