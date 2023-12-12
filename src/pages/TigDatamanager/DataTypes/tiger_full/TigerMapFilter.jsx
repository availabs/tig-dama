import React, {useEffect} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

const INITIAL_TIGER_YEAR = '2010';
const INITIAL_TIGER_TYPE = 'state';

export const TigerMapFilter = ({
    metaData,
    filters,
    setFilters,
    setTempSymbology,
    tempSymbology,
    layer
  }) => { 

  let newSymbology  = cloneDeep(tempSymbology);
 

  const year = filters['year']?.value || INITIAL_TIGER_YEAR;
  const tiger_type = filters['tiger_type']?.value || INITIAL_TIGER_TYPE;
  // const allYears = data?.map((val, i) => val.year).filter(onlyUnique);
  // const allTigerTypes = data?.map((val, i) => val.tiger_type).filter(onlyUnique);

  const allYears = [2010, 2020];
  const allTigerTypes = ['state', 'county', 'tract'];

  useEffect(() => {
    const initialFilters = {}
    if(!filters['year']?.value){
        initialFilters.year = { value: INITIAL_TIGER_YEAR}
    }
    if(!filters['tiger_type']?.value){
        initialFilters.tiger_type = { value: INITIAL_TIGER_TYPE}
    }

    setFilters(initialFilters);
  }, []);

  useEffect(() => {
    if (!newSymbology?.source) {
      newSymbology.sources = metaData?.tiles?.sources || [];
      newSymbology.layers = layer?.layers?.map(curLayer => {
        const [layer_type, layer_year] = curLayer['source-layer'].split('_')
        const shouldDisplay = +layer_year === +year && layer_type === tiger_type

        return {
          ...curLayer,
          layout: {
            visibility: shouldDisplay ? 'visible' : 'none'
          }
        }
      });
    }
  
    if(!isEqual(newSymbology, tempSymbology)){
      console.log("about to set new tempSymbology")
      setTempSymbology(newSymbology)
    }
  }, [filters, year, tiger_type])

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