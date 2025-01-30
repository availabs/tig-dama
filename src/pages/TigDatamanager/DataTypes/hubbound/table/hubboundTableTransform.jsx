import { HUBBOUND_ATTRIBUTES } from "../constants";

const HubboundTableTransform = (tableData, attributes, filters, setFilters, yearRange) => {

  //Clean out any `null` values
  //One day we might do this when we upload the data instead
  const cleanedData = tableData.map(tRow => {
    const newRow = Object.keys(tRow).reduce((accRow, curKey) => {
      accRow[curKey] = (typeof tRow[curKey] === 'object' || tRow[curKey] === "NULL") ? "" : tRow[curKey]

      return accRow;
    }, {})

    return newRow;
  });

  //The range of years is kept inside of view metadata 
  HUBBOUND_ATTRIBUTES.year.values = yearRange.map(yearStr => Number.parseInt(yearStr));
  return {
    data: cleanedData,
    columns: attributes
      ?.filter((d) => !(HUBBOUND_ATTRIBUTES[d].tableColumn === false))
      .map((d) => {
        const attrProps = HUBBOUND_ATTRIBUTES[d];
        const filterProperties =
          !attrProps.tableFilter
            ? undefined
            : {
                customValue: filters[d]?.value || undefined,
                filter: "dropdown",
                filterDomain: attrProps.values,
                filterMulti: attrProps.filterMulti === false ? false : true,
                onFilterChange: (newValue) => {
                  //range inputs are limited to 2 values
                  if (attrProps.type === "range" && newValue?.length > 2) {
                    newValue.shift();
                  }
                  if(newValue?.length === 0 && attrProps.values.includes("all")){
                    newValue.push("all");
                  }
                  if((newValue === null || newValue === undefined) && attrProps.values.includes("all")){
                    newValue = "all";
                  }
                  if(newValue.length === 2 && newValue.includes("all")){
                    newValue.shift();
                  }
                  setFilters({
                    ...filters,
                    [d]: { value: newValue },
                  });
                },
                filterPlaceholder:"Select value"
            };

        return {
          Header: d
            .split("_")
            .filter((chunk) => chunk.toLowerCase() !== "name")
            .join(" "),
          accessor: d,
          ...filterProperties,
        };
      }),
  };
};

export { HubboundTableTransform };
