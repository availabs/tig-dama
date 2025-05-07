import React from "react";
import MapPage from "~/pages/TigDatamanager/Utils/gisMap";
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import Table from "~/pages/TigDatamanager/Utils/gisTable";
import Chart from "./chart";

import { SedMapFilter, SedTableFilter, SedTableTransform, SedHoverComp } from "./sedCustom";
import { SedChartFilter, SedChartTransform } from "./sedChartTaz";
import { SedChartFilterCounty, SedChartTransformCounty } from "./sedChartCounty";

import { SedCustomAttribute } from "./sedCustomAttribute";
import { customRules } from "./sedCustomRules";
import dbColsTaz from "./dbColsTaz.json";
import dbColsCounty from "./dbColsCounty.json";
// import { getAttributes } from '~/pages/DataManager/components/attributes'
import TigOverview from "../TigOverview"
import TigMetadata from '../TigMetadata'
import config from "~/config.json"

import { sedVars, sedVarsCounty } from "./sedCustom"

const getVariables = (source,view,activeViewId) =>  {
  let vardata = source?.type === 'tig_sed_taz' ?  sedVars : sedVarsCounty
  return Object.keys(vardata)
    .map(key => ({
      key,
      name: vardata[key].name
    }))
}




export const tig_sed_taz = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview {...props} getVariables={getVariables}/>
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => <MapPage
      {...props}
      showViewSelector={false}
      MapFilter={SedMapFilter}
      HoverComp={{Component: SedHoverComp, isPinnable: true}}
      displayPinnedGeomBorder={true}
      mapStyles={[config?.google_streets_style]}
    />,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        showViewSelector={false}
        transform={SedTableTransform}
        TableFilter={SedTableFilter}
        fullWidth={true}
        striped={true}
      />
    ),
  },
  chart: {
    name: "Chart",
    path: "/chart",
    component: (props) => (
      <Chart
        {...props}
        transform={SedChartTransform}
        TableFilter={SedChartFilter}
      />
    ),
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: TigMetadata,
  },
  source_meta: {
    name: "Source Metadata",
    path: "/source_meta",
    hidden: false,
    component: Overview,
  },
  sourceCreate: {
    name: "Create",
    component: (props) => (
      <CreatePage
        {...props}
        dataType="tig_sed_taz"
        customRules={customRules}
        databaseColumnNames={dbColsTaz}
        CustomAttributes={SedCustomAttribute}
      />
    ),
  },
  add_version: {
    name: "Add Version",
    path: "/add_version",
    hidden: true,
    component: (props) => (
      <CreatePage
        {...props}
        dataType="tig_sed_taz"
        customRules={customRules}
        databaseColumnNames={dbColsTaz}
        CustomAttributes={SedCustomAttribute}
      />
    ),
  },
};


export const tig_sed_county = {
  overview: {
    name: "Overview",
    path: "",
    tag: 'test',
    component: (props) => <TigOverview {...props} getVariables={getVariables}/>
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => <MapPage
      {...props}
      showViewSelector={false}
      MapFilter={SedMapFilter}
      HoverComp={{Component: SedHoverComp, isPinnable: true}}
      displayPinnedGeomBorder={true}
      mapStyles={[config?.google_streets_style]}
    />,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        showViewSelector={false}
        {...props}
        transform={SedTableTransform}
        TableFilter={SedTableFilter}
        fullWidth={true}
        striped={true}
      />
    ),
  },
  chart: {
    name: "Chart",
    path: "/chart",
    component: (props) => (
      <Chart
        {...props}
        transform={SedChartTransformCounty}
        TableFilter={SedChartFilterCounty}
      />
    ),
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: TigMetadata,
  },
  source_meta: {
    name: "Source Metadata",
    path: "/source_meta",
    hidden: false,
    component: Overview,
  },
  sourceCreate: {
    name: "Create",
    component: (props) => (
      <CreatePage
        {...props}
        dataType="tig_sed"
        customRules={customRules}
        databaseColumnNames={dbColsCounty}
        CustomAttributes={SedCustomAttribute}
      />
    ),
  },
  add_version: {
    name: "Add Version",
    path: "/add_version",
    hidden:true,
    component: (props) => (
      <CreatePage
        {...props}
        dataType="tig_sed_county"
        customRules={customRules}
        databaseColumnNames={dbColsCounty}
        CustomAttributes={SedCustomAttribute}
      />
    ),
  },
};
