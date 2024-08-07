import { NPMRDS_ATTRIBUTES } from "../constants";
import moment from "moment";
const npmrdsTableTransform = (tableData, attributes, filters, setFilters) => {
  const flattenedData = tableData.map((tmcObj) => {
    const newTmcObj = { ...tmcObj };
    tmcObj["s"].forEach((value, hourVal) => {
      newTmcObj[hourVal] = value;
    });
    return newTmcObj;
  });

  const columns = attributes.map((attr) => {
    const columnConfig = {
      accessor: attr.toString(),
      filterPlaceholder: "Select value",
    };
    if (typeof attr === "number") {
      columnConfig.Header = moment(attr, "HH").format("HH:mm");
    } else {
      columnConfig.Header = attr
        .split("_")
        .filter((chunk) => chunk.toLowerCase() !== "name")
        .join(" ");
    }

    const attrProps = NPMRDS_ATTRIBUTES?.[attr];
    if (attrProps?.["tableHeaderFilter"]) {
      columnConfig.filter = "dropdown";
      columnConfig.customValue = filters[attr]?.value || undefined
      columnConfig.filterMulti = attrProps.filterMulti === false ? false : true;
      columnConfig.searchable = attrProps.searchable;
    }

    return columnConfig;
  });
  return {
    data: flattenedData,
    columns: columns,
  };
};

export { npmrdsTableTransform };
