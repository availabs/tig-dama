import React, { useEffect } from 'react'

const INITIAL_TIGER_YEAR = '2010';
const INITIAL_TIGER_TYPE = 'state';


function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

export const TigerTableFilter = (
  { source, filters, setFilters, data }
) => {

  const year = filters['year']?.value || null;
  const tiger_type = filters['tiger_type']?.value || null;

  const allYears = data?.map((val, i) => val.year).filter(onlyUnique);
  const allTigerTypes = data?.map((val, i) => val.tiger_type).filter(onlyUnique);

  useEffect(() => {
    const initialFilters = {}
    if(!year){
        initialFilters.year = { value: INITIAL_TIGER_YEAR}
    }
    if(!tiger_type){
        initialFilters.tiger_type = { value: INITIAL_TIGER_TYPE}
    }

    setFilters(initialFilters);
  }, []);

   
  return (
    <div className="flex flex-1 border-blue-100">
        <div className='py-3.5 px-2 text-sm text-gray-400'>Year : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={year || ''}
              onChange={(e) => setFilters({'year' :{ value: e.target.value}})}
            >
              {allYears?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Type : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={tiger_type || ''}
              onChange={(e) => setFilters({'tiger_type' :{ value: e.target.value}})}
            >
              {allTigerTypes?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
    </div>

  )
};

export const TigerTableTransform = (tableData, attributes, filters, years, source) => {
    let filteredData;
    const activeFilterKeys = Object.keys(filters).filter(
      (filterKey) => !!filters[filterKey].value
    );1
  
    filteredData = tableData.filter((val) => {
      const shouldKeep = activeFilterKeys.every((filterKey) => {
        return filters[filterKey].value === val[filterKey]?.toString();
      });
      return shouldKeep;
    });
  
    const columns = attributes
      .map((attr) => ({
        Header: attr,
        accessor: attr,
      }));

    return {
      data: filteredData,
      columns: columns,
    };
  }