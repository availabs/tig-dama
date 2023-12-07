import React, {useEffect} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

import { DamaContext } from "~/pages/DataManager/store"
import { fips2Name } from '../constants';


function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

const INITIAL_TIGER_YEAR = '2010';
const INITIAL_TIGER_TYPE = 'state';

export const TigerMapFilter = ({
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
  let newSymbology  = cloneDeep(tempSymbology);
 
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

//   let filteredData = data;
//   const alGeoIdColor = data.reduce((acc, key) => {
//     acc[name2fips[key.area]] = 0;
//     return acc;
//   }, {});

//   const filterKeys = Object.keys(filters);

//   filterKeys.forEach((key, i) => {
//     if(key !== 'activeVar') {
//       filteredData = filteredData.reduce((acc, val) => {
//         if(filters[key].value == val[key]) {
//             acc.push(val);
//         } 
//         return acc;
//       }, []);
//     }
//   });

console.log("ryan checking data",data);
  React.useEffect(() => {
    console.log("in use effect, layer", layer)


    console.log("new sym inside use efect",newSymbology)

    // const CountyValues = Object.values(filteredData)
     // filteredData should be shaped like
    /*
      {
        '36001': 55.44,
        '36036': 57.67
        ...
      }
  
          

    */
      newSymbology = (layer?.layers || []).reduce((acc, currentLayer) => {
        const [layerType, layerYear] = currentLayer['source-layer'].split('_');
        const shouldDisplay = layerType === tiger_type && layerYear === year;

        acc[currentLayer.id] = {
            ...currentLayer,
            // 'filter': ['in', ["literal", year], ["get", "source-layer"]],
            paint: {...currentLayer.paint, visibility: 'none', "fill-color":"#ffffff"},
            layout: {'visibility' : 'none'},
            // year: layerYear,
            // tiger_type: layerType,
            //filter:  ["==", ["literal", year], ["to-string", ["get", "year"]] ]
            // filter: ["all", ["==", ["to-string",["year"]], "2010"]]
        };

        // acc[currentLayer.id]['visibility'] = shouldDisplay ? 'visible' : 'none';
        return acc;
      }, {});

      console.log("newSymbology",newSymbology)
    if(!isEqual(newSymbology, tempSymbology)){

      setTempSymbology(newSymbology)
    }

  },[data, layer, filters, year, tiger_type]);
console.log("**old layer", layer)
console.log("*tiger full filters", filters)

  return (
    <div className='flex flex-1'>
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


}