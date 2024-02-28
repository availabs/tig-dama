import Table from "./table";
import MapPage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import { HubboundTableFilter, HubboundTableTransform } from "./table/hubboundFilters";
import { HubboundMapFilter } from "./map/HubboundMapFilter";

const hubboundConfig = {
  sourceCreate: {
    name: "Create",
    component: (props) => <CreatePage {...props} dataType="hubbound" />,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <Table
        {...props}
        // transform={HubboundTableTransform}
        TableFilter={HubboundTableFilter}
      />
    ),
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => (
      <MapPage 
        {...props}
        showViewSelector={false}
        MapFilter={HubboundMapFilter}
        // HoverComp={{Component: ProjectHoverComp, isPinnable: true}}
      />
    ),
  },
};

export default hubboundConfig;
