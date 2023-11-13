import React, { useEffect, useState } from "react";
import { Button } from "~/modules/avl-components/src"
import download from "downloadjs"
import { variableAccessors } from "./BPMConstants";

export const HBTableFilter = ({ source, filters, setFilters, data, columns }) => {
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
      <div className='flex flex-1'>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Time period : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={timePeriod}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Functional class : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
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
        <div>
          <Button themeOptions={{size:'sm', color: 'primary'}}
            onClick={ downloadData }
          >
            Download
          </Button>
        </div>
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
  
  //For a given area + period + functional_class, there may be more than 1 row of data
  //We need to sum or average the data together
  const sumAll = data.reduce((sumAll, d) => {
    if(!sumAll[d?.area]){
      sumAll[d?.area] = {
        ogc_fid: d.ogc_fid,
        total_vehicle_miles_traveled: 0,
        total_vehicle_hours_traveled: 0,
        total_speed: 0,
        count: 0
      }
    }

    sumAll[d?.area] = {
      total_vehicle_miles_traveled: Number(d?.vehicle_miles_traveled) + sumAll[d.area].total_vehicle_miles_traveled || 0,
      total_vehicle_hours_traveled: Number(d?.vehicle_hours_traveled) + sumAll[d.area].total_vehicle_hours_traveled || 0,
      total_speed: d?.ave_speed + sumAll[d.area].total_speed || 0,
      count: 1+sumAll[d?.area]?.count || 0
    }
    return sumAll
  }, {});



  const outputData = Object.keys(sumAll).map((countyName) => {
    const countyData = sumAll[countyName];

    return {
      [variableAccessors.VMT]: countyData['total_vehicle_miles_traveled'],
      [variableAccessors.VHT]: countyData['total_vehicle_hours_traveled'],
      [variableAccessors.AvgSpeed]: countyData.total_speed/countyData.count,
      area: countyName,
      ogc_fid: countyData['ogc_fid']
    }
  });

  const columns = [
      {
        Header: 'County',
        accessor: 'area'
      },
      {
        Header: 'VMT (in Thousands)',
        accessor: variableAccessors.VMT,
        Cell: (d) => <div>{Math.round(d.value).toLocaleString()}</div>
      },
      {
        Header: 'VHT (in Thousands)',
        accessor: variableAccessors.VHT,
        Cell: (d) => <div>{Math.round(d.value).toLocaleString()}</div>
      },
      {
        Header: 'Avg. Speed (Miles/Hr)',
        accessor: variableAccessors.AvgSpeed,
        Cell: (d) => <div>{(d.value).toFixed(2).toLocaleString()}</div>
      }
    ]

  
    return {
      data: outputData,
      columns: columns,
    };
};
