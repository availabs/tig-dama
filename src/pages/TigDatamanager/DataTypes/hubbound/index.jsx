import Table from "./table";
import CreatePage from "~/pages/DataManager/DataTypes/gis_dataset/pages/Create";
import { HubboundTableFilter, HubboundTableTransform } from "./table/hubboundFilters";

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
};

export default hubboundConfig;
