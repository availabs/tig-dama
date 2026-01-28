import CreatePage from "./create";
import RawOverview from "./overview";
import Overview from "~/pages/DataManager/DataTypes/default/Overview";
import Admin from "../default/Admin"
const NpmrdsRawConfig = {
  sourceCreate: {
    name: "Create",
    component: CreatePage,
  },
  add_version: {
    name: "Add Version",
    path: "/add_version",
    component: CreatePage,
  },
  view: {
    name: "View",
    path: "/view",
    component: RawOverview,
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

export default NpmrdsRawConfig;