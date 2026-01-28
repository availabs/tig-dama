
import Admin from "../default/Admin"
import Table from "../../Utils/gisTable";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
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
  sourceCreate: {
    name: "Create",
    component: (props) => (
      <CreatePage
        {...props}
        useMbTiles={true}
        tippecanoeOptions={{flags: ['-b0']}}
        defaultTilesColumns={['ptype']}
      />
    )
  },
};

export default CsvDatasetConfig;
