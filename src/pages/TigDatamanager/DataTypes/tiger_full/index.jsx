import React from "react";
import Create from "./create";
import Table from "~/pages/DataManager/DataTypes/gis_dataset/pages/Table";
import Map from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";

const tigerFull2017Config = {
  sourceCreate: {
    name: "Create",
    component: Create,
  },
  table: {
    name: "Table",
    path: "/table",
    component: Table
  },
  map: {
    name: "Map",
    path: "/map",
    component: Map
  },
};

export default tigerFull2017Config;
