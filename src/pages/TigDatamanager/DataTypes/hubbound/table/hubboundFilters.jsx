import React, {
  useEffect,
  useMemo,
} from "react";
import { get } from "lodash";

const OUTBOUND_VAL = "Outbound";
const INBOUND_VAL = "Inbound";

const HubboundTableFilter = ({ source, filters, setFilters, data, columns }) => {
  // console.log("HubboundTableFilter", filters);

  const years = useMemo(() => {
    //RYAN TODO set hubbound metadata on source create
    const finishYear = 2020;
    const startYear = 2007
    return Array.from(
      { length: finishYear - startYear },
      (_, i) => startYear + 1 + i
    )

  }, []);

  const directions = [OUTBOUND_VAL, INBOUND_VAL];

  const year =  filters?.year?.value;
  const direction = filters?.direction?.value;

  useEffect(() => {
    const newFilters = {...filters};
    if (!year && years && years.length) {
      newFilters.year = { value: 2019 }
    }
    if (!direction) {
      newFilters.direction = { value: OUTBOUND_VAL }
    }
    
    setFilters(newFilters)
  }, []);

  return (
    <div className="flex flex-1 border-blue-100">
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Year: </div>
        <div className="px-2">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={year}
            onChange={(e) =>
              setFilters({ ...filters, year: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={'all'}>
              All
            </option>
            {years.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Direction: </div>
        <div className="px-2">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={direction}
            onChange={(e) =>
              setFilters({ ...filters, direction: { value: e.target.value } })
            }
          >
            {directions.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const HubboundTableTransform = (tableData, attributes, filters, years,source) => {
  let activeVar = get(filters, "activeVar.value", "totpop");

  let updatedYears = years?.map((str) => (''+str).slice(-2));
  const columns = [
    {
      Header: "County",
      accessor: "county",
      sortBy: 'asc'
    },
  ];

  updatedYears.forEach((y, i) => {
    columns.push({
      Header: `20${y}`,
      accessor: `${activeVar}_${i}`,
      Cell: ({ value }) => Math.round(value).toLocaleString(),
    });
  });

  return {
    data: tableData,
    columns,
  };
};

export { HubboundTableFilter, HubboundTableTransform };