import Table from "./table";
import MapPage from "~/pages/TigDatamanager/Utils/gisMap";
import CreatePage from "./create";
import TigOverview from '../TigOverview';
import TigMetadata from '../TigMetadata';
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import { HubboundTableTransform } from "./table/hubboundTableTransform";
import { HubboundMapFilter } from "./map/HubboundMapFilter";
import { HubboundFilters } from "./map/hubboundFilters";
import { HubboundMapHover } from "./map/HubboundMapHover";
import {
  HubboundChartTransform,
  HubboundChartFilters,
} from "./chart/chartFilters";
import Chart from "./chart";

import config from "~/config.json"

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
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: TigMetadata,
  },
  source_meta: {
    name: "Source Metadata",
    path: "/source_meta",
    hidden: true,
    component: Overview,
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
        fullWidth={true}
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
        mapStyles={[config?.google_streets_style]}
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
