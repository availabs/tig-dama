import NpmrdsTable from "./table"
import MapPage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Map";
import { npmrdsMapFilter } from "./map/npmrdsMapFilter";
import {npmrdsHoverComp} from './map/npmrdsHoverComp'
import CreatePage from "./pages/Create";
import ManagePage from "./pages/manage";
import TigOverview from "../TigOverview";
import { npmrdsTableTransform } from "./table/npmrdsTableTransform";
import config from "~/config.json"
const getVariables = (source, views, activeViewId) =>
  views.map((d) => ({
    key: d.view_id,
    name: d.version || d.view_id,
    type: "view",
  }));

const npmrdsConfig = {
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
    component: (props) => <CreatePage {...props} />,
  },
  table: {
    name: "Table",
    path: "/table",
    component: (props) => (
      <NpmrdsTable
        {...props}
        transform={npmrdsTableTransform}
        fullWidth={true}
      />
    ),
  },
  manage: {
    name: "Manage",
    path: "/manage",
    component: ManagePage,
  },
  map: {
    name: "Map",
    path: "/map",
    component: (props) => (
      <MapPage
        {...props}
        showViewSelector={false}
        MapFilter={npmrdsMapFilter}
        HoverComp={{Component: npmrdsHoverComp, isPinnable: true}}
        mapStyles={[config?.google_streets_style]}
      />
    ),
  },
};

export default npmrdsConfig;
