
import Admin from "../default/Admin"
import Table from "../../Utils/gisTable";
const CsvDatasetConfig = {
  table: {
    name: "Table",
    path: "/table",
    component: Table,
  },
  admin: {
    name: "Admin",
    path: "/admin",
    authLevel: 10,
    component: Admin
  },
};

export default CsvDatasetConfig;
