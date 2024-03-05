import { HUBBOUND_ATTRIBUTES } from "../constants";

//To change/remove the placeholder text, changes would need to be made to:
//src/modules/avl-components/src/components/Table/components/DropDownColumnFilter.jsx
//(currently, there is a misspelled `placeHolder` being passed to a `Select`)
const HubboundTableTransform = (tableData, attributes, filters, setFilters) => {
  return {
    data: tableData,
    columns: attributes
      ?.filter((d) => !(HUBBOUND_ATTRIBUTES[d].tableColumn === false))
      .map((d) => {
        const attrProps = HUBBOUND_ATTRIBUTES[d];
        const filterProperties =
          attrProps.tableFilter === false
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
                  setFilters({
                    ...filters,
                    [d]: { value: newValue },
                  });
                },
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
