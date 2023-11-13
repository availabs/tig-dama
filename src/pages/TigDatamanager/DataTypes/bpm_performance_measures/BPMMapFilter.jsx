import React, {useEffect} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { getColorRange } from "~/modules/avl-components/src";

import { DamaContext } from "~/pages/DataManager/store"
import { fips2Name } from '../constants';
import { variableAccessors } from "./BPMConstants";

import { Button } from "~/modules/avl-components/src"
import shpwrite from  '@mapbox/shp-write'


const MapDataDownloader = ({ activeViewId, activeVar,functionalClass,timePeriod,mapData  }) => {
  
  const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);

    if (!pgEnv || !Object.keys(mapData).length ) return;
    const geoids = Object.keys(mapData)
    falcor.get([
        "dama",
        pgEnv,
        "tiger",
        [311],
        geoids,
        ['2020'],
        ['county'],
        "attributes",
        ["geoid", "wkb_geometry", "name"],
      ])
    .then((d) => {
      setLoading(false)
    })
  }, [falcor, pgEnv, mapData])

  const downloadData = () => {
    const length = get(falcorCache, ['dama', pgEnv, 'viewsbyId', activeViewId, 'data', 'length'], 0);
    const path = ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"];
    
    const collection = {
      type: "FeatureCollection",
      features: Object.keys(mapData).map(geoid => {
        const properties = { 
          geoid, 
          county: fips2Name[geoid], 
          [activeVar] : mapData[geoid] 
        }

        const geometry = JSON.parse(get(falcorCache, [
          "dama",
          pgEnv,
          "tiger",
          [311],
          geoid,
          ['2020'],
          ['county'],
          "attributes",
          "wkb_geometry"
        ], "{}"));

        if(geometry.type === 'Polygon') {
          geometry.type = 'MultiPolygon'
          geometry.coordinates = [geometry.coordinates]
        }
        
        return {
          type: "Feature",
          properties,
          geometry
        }
      })
    }

    const options = {
      folder: `tig_bpm_measures_${activeVar}_${timePeriod}_${functionalClass}`,
      file: `tig_bpm_measures_${activeVar}_${timePeriod}_${functionalClass}`,
      outputType: "blob",
      compression: "DEFLATE",
    }
    shpwrite.download(collection, options)
  };

  return (
    <div>
      <Button themeOptions={{size:'sm', color: 'primary'}}
        onClick={ downloadData }
        disabled={ loading }
      >
        Download
      </Button>
    </div>
  )
}


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
  let newSymbology  = cloneDeep(tempSymbology);
  const name2fips = Object.fromEntries(Object.entries(fips2Name).map(([key, value]) => [value, key]));
 
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
  const variableClasses = ["VMT", "VHT", "AvgSpeed"];
  
  useEffect(() => {
    if(!timePeriod)
      setFilters({'period' : { value: 'all_day'}});

    if(!functionalClass)
    setFilters({'functional_class' : { value: 'total'}});

    if(!variable)
    setFilters({'activeVar' : { value: 'VMT'}});
  }, []);

  let filteredData = data;
  const alGeoIdColor = data.reduce((acc, key) => {
    acc[name2fips[key.area]] = 0;
    return acc;
  }, {});

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

  //For a given area + period + functional_class, there may be more than 1 row of data
  //We need to sum or average the data together
  const sumAll = filteredData.reduce((sumAll, d) => {
    if(!sumAll[  name2fips[d?.area]]){
      sumAll[  name2fips[d?.area]] = {
        ogc_fid: d.ogc_fid,
        [variableAccessors.VMT]: 0,
        [variableAccessors.VHT]: 0,
        total_speed: 0,
        count: 0
      }
    }

    sumAll[name2fips[d?.area]] = {
      [variableAccessors.VMT]: Number(d?.vehicle_miles_traveled) + sumAll[  name2fips[d?.area]][variableAccessors.VMT] || 0,
      [variableAccessors.VHT]: Number(d?.vehicle_hours_traveled) + sumAll[  name2fips[d?.area]][variableAccessors.VHT] || 0,
      total_speed: d?.ave_speed + sumAll[  name2fips[d?.area]].total_speed || 0,
      count: 1+sumAll[  name2fips[d?.area]]?.count || 0
    }
    return sumAll
  }, {});

  
  Object.values(sumAll).forEach(area => {
    area[variableAccessors.AvgSpeed] =  area.total_speed/area.count
  })

  const formattedData = {};

  Object.keys(sumAll).forEach(areaId => {
    formattedData[areaId] = sumAll[areaId][variableAccessors[variable]]
  })


  const mapData = formattedData

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

    function colorScale(domain, areaValue) {
      let color = range[0];//"rgba(0,0,0,0)";
      (domain || []).forEach((domainValue, i) => {
        if (areaValue >= domainValue && (!domain[i+1] || areaValue <= domain[i + 1])) {
          color = range[i];
        }
      });
      return color;
    }

    const colors = {};
    Object.keys({...alGeoIdColor, ...mapData}).forEach((geoid) => {
      colors[geoid] = colorScale(domain, mapData[geoid]);
    });

    let output = ["coalesce", ["get",["to-string",["get","geoid"]], ["literal", colors]],"rgba(0,0,0,0)"]

    newSymbology = (layer?.layers || []).reduce((a, c) => {
      a[c.id] = {
        "fill-color": {
          [variable]: {
            type: 'threshold',
            settings: {
              range: range,
              domain: domain,
              title: variable
            },
            value: output
          }
        }
      };
      return a;
    }, {});

    if(!isEqual(newSymbology, tempSymbology)){
      setTempSymbology(newSymbology)
    }

  },[mapData, filters, timePeriod, functionalClass, variable]);

  return (
    <div className='flex flex-1'>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Variable : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={variable || ''}
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
              value={timePeriod || ''}
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
              value={functionalClass || ''}
              onChange={(e) => setFilters({'functional_class' :{ value: e.target.value}})}
            >
              {allFunctionalClasses?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <MapDataDownloader
          timePeriod={timePeriod}
          functionalClass={functionalClass}
          mapData={mapData}
          activeViewId={ activeViewId }
          activeVar={ variable }
        />
      </div>
  )


}
