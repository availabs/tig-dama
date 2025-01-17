import React, { useEffect } from "react";
import { Button } from "~/modules/avl-components/src"
import download from "downloadjs"
import { variableAccessors, BPM_DISPLAY_DIVISOR, variableLabels } from "./BPMConstants";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";

export const HBTableFilter = ({ filters, setFilters, data, columns, userHighestAuth }) => {
    const timePeriod = filters['period']?.value || null;
    const functionalClass = filters['functional_class']?.value || null;

    function onlyUnique(value, index, array) {
      return array.indexOf(value) === index;
    }

    const allTimePeriods = data.map((val, i) => val.period).filter(onlyUnique);
    const allFunctionalClasses = data.map((val, i) => val.functional_class).filter(onlyUnique);
    
    useEffect(() => {
      if(!timePeriod)
        setFilters({'period' : { value: 'all_day'}});

      if(!functionalClass)
      setFilters({'functional_class' : { value: 'total'}});
    }, []);

    const downloadData = React.useCallback(() => {
      const mapped = data.map(d => {
        return columns.map(c => {
          return d[c.accessor];
        }).join(",")
      })
      mapped.unshift(columns.map(c => c.Header).join(","));
      download(mapped.join("\n"), `tig_bpm_measures_${timePeriod}_${functionalClass}.csv`, "text/csv");
    }, [data, columns]);

    return (
      <div className='flex justify-start content-center flex-wrap w-full p-1'>
        <div className='flex py-3.5 px-2 text-sm text-gray-400 capitalize'>Time period : </div>
        <div className='flex'>
          <select
              className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
              value={timePeriod}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v?.replace("_"," ")}
                </option>
              ))}
          </select>
        </div>
        <div className='flex py-3.5 px-2 text-sm text-gray-400 capitalize'>Functional class : </div>
        <div className='flex'>
          <select
              className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
              value={functionalClass}
              onChange={(e) => setFilters({'functional_class' :{ value: e.target.value}})}
            >
              {allFunctionalClasses?.map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="flex ml-auto">
          <Button themeOptions={{size:'sm', color: 'primary'}}
            onClick={ downloadData }
          >
            Download
          </Button>
        </div>}
      </div>
    )
}

export const BPMTableTransform = (tableData, attributes, filters) => {
  const filterKeys = Object.keys(filters);
  let data = tableData;

  //Filter out any data that does not match our filters (time period and functional class)
  filterKeys.forEach((key, i) => {
    data = data.reduce((acc, val) => {
      if(filters[key].value == val[key]) {
          acc.push(val);
      } 
      return acc;
    }, []);
  });

  const sumAll = data.reduce((sumAll, d) => {
    if(!sumAll[d?.area]){
      sumAll[d?.area] = {
        ogc_fid: d.ogc_fid,
        [variableAccessors.VMT]: 0,
        [variableAccessors.VHT]: 0,
        total_speed: 0,
        count: 0
      }
    }

    sumAll[d?.area] = {
      [variableAccessors.VMT]: Number(d?.[variableAccessors.VMT]) + sumAll[d?.area][variableAccessors.VMT] || 0,
      [variableAccessors.VHT]: Number(d?.[variableAccessors.VHT]) + sumAll[d?.area][variableAccessors.VHT] || 0,
      total_speed: d?.ave_speed + sumAll[d?.area].total_speed || 0,
      count: 1+sumAll[d?.area]?.count || 0
    }
    return sumAll
  }, {});

  const outputData = Object.keys(sumAll).map((area) => {
    const countyData = sumAll[area];

    return {
      ...countyData,
      area,
      [variableAccessors.AvgSpeed]: countyData.total_speed/countyData.count,
    }
  });

  const columns = [
      {
        Header: 'County',
        accessor: 'area'
      },
      {
        Header: variableLabels.VMT,
        accessor: variableAccessors.VMT,
        Cell: (d) => <div>{Math.round(d.value).toLocaleString()}</div>
      },
      {
        Header: variableLabels.VHT,
        accessor: variableAccessors.VHT,
        Cell: (d) => <div>{Math.round(d.value).toLocaleString()}</div>
      },
      {
        Header: variableLabels.AvgSpeed,
        accessor: variableAccessors.AvgSpeed,
        Cell: (d) => <div>{(d.value).toFixed(2).toLocaleString()}</div>
      }
    ]

  
    return {
      data: outputData,
      columns: columns,
    };
};
