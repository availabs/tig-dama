import Create from "./create";
import Table from "~/pages/DataManager/DataTypes/gis_dataset/pages/Table";
import Map from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";

import { TigerMapFilter } from "./TigerMapFilter";
import { TigerTableFilter, TigerTableTransform } from "./TigerTableFilter";

const tigerFull2017Config = {
  sourceCreate: {
    name: "Create",
    component: Create,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        showViewSelector={false}
        TableFilter={TigerTableFilter}
        transform={TigerTableTransform}
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
        MapFilter={TigerMapFilter}
      />
    ),
    
  },
};

export default tigerFull2017Config;
