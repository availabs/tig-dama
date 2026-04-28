import Admin from "../default/Admin"
import TigOverview from "../TigOverview";
import Overview from "~/pages/DataManager/DataTypes/default/Overview";

const getVariables = (source, views, activeViewId) =>
  views.map((d) => ({
    key: d.view_id,
    name: d.version || d.view_id,
    type: "view",
  }));

const npmrds_raw_tmc_identification = {
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
  }
};

export default npmrds_raw_tmc_identification;
