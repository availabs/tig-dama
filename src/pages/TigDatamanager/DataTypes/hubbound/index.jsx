import Table from "./table";
import MapPage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import TigOverview from "../TigOverview";
import { HubboundTableTransform } from "./table/hubboundTableTransform";
import { HubboundMapFilter } from "./map/HubboundMapFilter";
import { HubboundFilters } from "./map/hubboundFilters";
import { HubboundMapHover } from "./map/HubboundMapHover";
import {
  HubboundChartTransform,
  HubboundChartFilters,
} from "./chart/chartFilters";
import Chart from "./chart";

const getVariables = (source, views, activeViewId) =>
  views.map((d) => ({
    key: d.view_id,
    name: d.version || d.view_id,
    type: "view",
  }));

const hubboundConfig = {
  overview: {
    name: "Overview",
    path: "",
    tag: "test",
    component: (props) => (
      <TigOverview {...props} getVariables={getVariables} />
    ),
  },
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
        transform={HubboundTableTransform}
        filterData={{ year: { value: [2019] } }}
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
        HoverComp={{ Component: HubboundMapHover, isPinnable: true }}
      />
    ),
  },
  chart: {
    name: "Chart",
    path: "/chart",
    component: (props) => (
      <Chart
        {...props}
        transform={HubboundChartTransform}
        ChartFilter={HubboundChartFilters}
        HubboundFilter={HubboundFilters}
      />
    ),
  },
};

export default hubboundConfig;
