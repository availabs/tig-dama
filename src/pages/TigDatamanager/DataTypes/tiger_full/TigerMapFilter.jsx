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

  const activeFilterKeys = Object.keys(filters).filter(
      (filterKey) => !!filters[filterKey].value
  );
  const filteredData = data.filter((val) => {
      return +val['year'] === +year && val['tiger_type'] === tiger_type
  });
  const filteredIds = filteredData.map((d) => d.ogc_fid);

  if (!newSymbology?.source) {
      newSymbology.sources = metaData?.tiles?.sources || [];
      newSymbology.layers = layer.layers;
  }

  if (activeFilterKeys.length && filteredIds.length) {
      newSymbology.filter = filteredIds;
  }

  if(!isEqual(newSymbology, tempSymbology)){
      setTempSymbology(newSymbology)
  }

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