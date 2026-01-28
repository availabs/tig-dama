import MapPage from "~/pages/TigDatamanager/Utils/gisMap";
import Admin from "../default/Admin"
const NpmrdsMetaConfig = {
  map: {
    name: "Map",
    path: "/map",
    component: MapPage,
  },
  admin: {
    name: "Admin",
    path: "/admin",
    authLevel: 10,
    component: Admin
  }
};

export default NpmrdsMetaConfig;
