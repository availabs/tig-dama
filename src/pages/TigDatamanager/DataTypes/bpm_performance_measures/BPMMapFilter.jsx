import React, {useEffect} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { getColorRange } from "~/modules/avl-components/src";

import { Combobox } from '@headlessui/react'

//import ProjectHoverComp from './MapHoverComp'

import { DamaContext } from "~/pages/DataManager/store"
import { fips2Name } from '../constants';

export const BPMMapFilter = ({
    source,
    metaData,
    filters,
    setFilters,
    setTempSymbology,
    tempSymbology,
    activeViewId,
    layer
  }) => { 

  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  let newSymbology  = cloneDeep(tempSymbology)
 
  React.useEffect(() => {
    const loadSourceData = async () => {
    
      const d = await falcor.get(['dama',pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length']);
      let length = get(d,
        ['json', 'dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'],
      0)
      const metadata =  (source?.metadata?.columns || source?.metadata || []).map(d => d.name);

      await falcor.get([
        'dama',
        pgEnv,
        'viewsbyId',
        activeViewId,
        'databyIndex',
        [...Array(length).keys()],
        metadata
      ])
    
    }
    loadSourceData()
  },[pgEnv,activeViewId,source]);

  const data = Object.values(React.useMemo(() => {
    return get(falcorCache,
      ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
    {})
  },[falcorCache, filters]));  

  const timePeriod = filters['period']?.value || null;
  const functionalClass = filters['functional_class']?.value || null;
  const variable = filters['activeVar']?.value || null;

  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  const allTimePeriods = data?.map((val, i) => val.period).filter(onlyUnique);
  const allFunctionalClasses = data?.map((val, i) => val.functional_class).filter(onlyUnique);
  const variableClasses = ["VMT", "VHT", "Avg. Speed"];
  
  useEffect(() => {
    if(!timePeriod)
      setFilters({'period' : { value: 'all_day'}});

    if(!functionalClass)
    setFilters({'functional_class' : { value: 'total'}});

    if(!variable)
    setFilters({'activeVar' : { value: 'VMT'}});
  }, []);

  let filteredData = data;
  const filterKeys = Object.keys(filters);

  filterKeys.forEach((key, i) => {
    if(key !== 'activeVar') {
      filteredData = filteredData.reduce((acc, val) => {
        if(filters[key].value == val[key]) {
            acc.push(val);
        } 
        return acc;
      }, []);
    }
  });

  const variableAccessors = {
    "VMT" : "vehicle_miles_traveled",
    "VHT" : "vehicle_hours_traveled",
    "Avg. Speed": "ave_speed"
  };
  const name2fips = Object.fromEntries(Object.entries(fips2Name).map(([key, value]) => [value, key]));
  const mapData = filteredData.reduce((acc, val) => {
    //console.log('areas', val.area, name2fips[val.area])
    acc[name2fips[val.area]] = Number(val[variableAccessors[variable]]);
    return acc;
  }, {});

  console.log("what is the final mapData: ", mapData);

  React.useEffect(() => {
    // const CountyValues = Object.values(filteredData)
     // filteredData should be shaped like
    /*
      {
        '36001': 55.44,
        '36036': 57.67
        ...
      }
  
    */
    console.log('map data updated running color stuff',filters)
    let activeVar = filters?.activeVar?.value || 'default'
    const ckmeansLen = Math.min((Object.values(mapData) || []).length, 5);
    const values = Object.values(mapData || {});
    let domain = [0, 10, 25, 50, 75, 100];
    if (ckmeansLen <= values.length) {
      domain = ckmeans(values, ckmeansLen) || [];
    }
    const range = getColorRange(5, "YlOrRd", false);

    if (!(domain && domain?.length > 5)) {
      const n = domain?.length || 0;
      for (let i = n; i < 5; i++) {
        domain.push(domain[i - 1] || 0);
      }
    }

    function colorScale(domain, value) {
      let color = range[0];//"rgba(0,0,0,0)";
      (domain || []).forEach((v, i) => {
        if (value >= v && value <= domain[i + 1]) {
          color = range[i];
        }
      });
      return color;
    }

    const colors = {};
    Object.keys(mapData).forEach((geoid) => {
      colors[geoid] = colorScale(domain, mapData[geoid]);
    });

    console.log('active_var', activeVar);

    let output = ["coalesce", ["get",["to-string",["get","geoid"]], ["literal", colors]],"rgba(0,0,0,0)"]

    newSymbology = (layer?.layers || []).reduce((a, c) => {
        a[c.id] = {
          "fill-color": {
            [activeVar]: {
              type: 'threshold',
              settings: {
                range: range,
                domain: domain,
                title: activeVar
              },
              value: output
            }
          }
        };
        return a;
      }, {});
      console.log('new symbology', newSymbology)
      if(!isEqual(newSymbology, tempSymbology)){
        console.log('setting new newSymbology')
        setTempSymbology(newSymbology)
      }

  },[mapData]);

  // console.log("what is the value of the new symbology: ", newSymbology);

  

  return (
    <div className='flex flex-1'>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Variable : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={variable}
              onChange={(e) => setFilters({'activeVar' :{ value: e.target.value}})}
            >
              {variableClasses?.filter(d => d).map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Time period : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={timePeriod}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.filter(d => d && d !== 'null').map((v,i) => (
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
              {allFunctionalClasses?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
      </div>
  )


}
