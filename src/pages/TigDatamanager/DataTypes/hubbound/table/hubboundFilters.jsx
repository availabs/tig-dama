import React, {
  useEffect,
  useMemo,
} from "react";
import { get } from "lodash";
import { HUBBOUND_ATTRIBUTES } from "../constants";

//`count` is excluded because API endpoint currently does not support `<` or `>` operations
//`hour` is currently restricted to a single hour, for the same reason

const HubboundTableFilter = ({ filters, setFilters, filtersToExclude }) => {
  const years = useMemo(() => {
    //RYAN TODO set hubbound metadata on source create
    const finishYear = 2020;
    const startYear = 2007
    return Array.from(
      { length: finishYear - startYear },
      (_, i) => startYear + 1 + i
    )

  }, []);

  const year =  filters?.year?.value;

  useEffect(() => {
    const newFilters = {...filters};
    if (!year && years && years.length) {
      newFilters.year = { value: 2019 }
    }    
    setFilters(newFilters)
  }, []);

  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pb-1 justify-start gap-1 p-2">
      {Object.keys(HUBBOUND_ATTRIBUTES).filter(attrKey => !filtersToExclude.includes(attrKey)).map(attrName => {
        return <FilterInput key={`filter_input_${attrName}`} setFilters={setFilters} filters={filters} name={attrName} attribute={HUBBOUND_ATTRIBUTES[attrName]} value={filters[attrName]?.value || ""}/>
      })}
    </div>
  );
};

const FilterInput = ({ attribute, name, value, setFilters, filters }) => {
  const { values } = attribute;
  return (
    <div className="flex  justify-start content-center flex-wrap">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">{name.split("_").join(" ")}:</div>
      <div className="flex px-2">
        <select
          className="pl-3 pr-4 py-2.5 border  w-full bg-white mr-2 flex text-sm"
          value={value}
          onChange={(e) =>
            setFilters({ ...filters, [name]: { value: e.target.value } })
          }
        >
          <option className="ml-2  truncate" value={"all"}>
            --
          </option>
          {values?.map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const COLUMNS_TO_EXCLUDE = ['latitude', 'longitude'];
const HubboundTableTransform = (tableData, attributes) => {
  return {
    data: tableData,
    columns: attributes?.filter(d => !COLUMNS_TO_EXCLUDE.includes(d)).map((d) => ({
      Header: d.split("_").filter(chunk => chunk.toLowerCase() !== "name").join(' '),
      accessor: d,
    })),
  };
};
export { HubboundTableFilter, HubboundTableTransform };