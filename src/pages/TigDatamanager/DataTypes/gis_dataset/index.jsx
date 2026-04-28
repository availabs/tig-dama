import Admin from "../default/Admin"
import TigOverview from "../TigOverview";
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
const getVariables = (source, views, activeViewId) =>
  views.map((d) => ({
    key: d.view_id,
    name: d.version || d.view_id,
    type: "view",
  }));

const gis_dataset = {
  overview: {
    name: "Overview",
    path: "",
    tag: "test",
    component: (props) => (
      <TigOverview {...props} getVariables={getVariables} hideVariables={true}/>
    ),
  },
  meta: {
    name: "Metadata",
    path: "/meta",
    hidden: false,
    component: Overview,
  },
  admin: {
    name: "Admin",
    path: "/admin",
    authLevel: 10,
    component: Admin
  },
  sourceCreate: {
    name: "Create",
    component: CreatePage
  },
};

export default gis_dataset;
