import Create from "./create";
import Table from "~/pages/TigDatamanager/Utils/gisTable";
import Map from "~/pages/TigDatamanager/Utils/gisMap";
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
