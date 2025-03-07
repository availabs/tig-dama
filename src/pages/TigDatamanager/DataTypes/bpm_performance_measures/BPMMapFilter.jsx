import React, {useEffect} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import mapboxgl from "maplibre-gl";
import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { getColorRange } from "~/modules/avl-components/src";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";

import { DamaContext } from "~/pages/DataManager/store"
import { fips2Name } from '../constants';
import { variableAccessors } from "./BPMConstants";

import { Button } from "~/modules/avl-components/src"
import shpwrite from  '@mapbox/shp-write'
const GEOM_TYPES = {
  Point: "Point",
  MultiLineString: "MultiLineString",
  MultiPolygon: "MultiPolygon",
};

const MAP_GEOM_VIEW_ID = 311; //prod value
// const MAP_GEOM_VIEW_ID = 1374; // replace with appropriate ${viewId} for environment

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
        [MAP_GEOM_VIEW_ID],
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
          [MAP_GEOM_VIEW_ID],
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
    layer,
    userHighestAuth
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
    if(key !== 'activeVar' && key !== 'projectId') {
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
    const countyName = name2fips[d?.area];
    if(!sumAll[countyName]){
      sumAll[countyName] = {
        ogc_fid: d.ogc_fid,
        [variableAccessors.VMT]: 0,
        [variableAccessors.VHT]: 0,
        total_speed: 0,
        count: 0
      }
    }

    sumAll[countyName] = {
      [variableAccessors.VMT]: Number(d?.[variableAccessors.VMT]) + sumAll[countyName][variableAccessors.VMT] || 0,
      [variableAccessors.VHT]: Number(d?.[variableAccessors.VHT]) + sumAll[countyName][variableAccessors.VHT] || 0,
      total_speed: d?.ave_speed + sumAll[countyName].total_speed || 0,
      count: 1+sumAll[countyName]?.count || 0
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

  const geoids = Object.keys(mapData)
  React.useEffect(() => {
    const loadMapGeoms = async () => {
     await falcor.get([
        "dama",
        pgEnv,
        "tiger",
        [MAP_GEOM_VIEW_ID],
        geoids,
        ['2020'],
        ['county'],
        "attributes",
        ["geoid", "wkb_geometry", "name"],
      ])
    }

    loadMapGeoms()
  },[pgEnv, geoids]);

  const areaOptions = Object.keys(formattedData); 

  /**
   * 
   * TODO reanme `projectIdFilterValue` here and in SED
   */

  const projectIdFilterValue = filters["projectId"]?.value || null;

  const projectCalculatedBounds = React.useMemo(() => {
    if (projectIdFilterValue) {
      const countyMetadata = get(falcorCache, [
        "dama",
        pgEnv,
        "tiger",
        MAP_GEOM_VIEW_ID,
        projectIdFilterValue,
        ['2020'],
        ['county'],
        "attributes"
      ], "{}");

      console.log("filtered to countyMetadata::", countyMetadata);
      const projectGeom = !!countyMetadata?.wkb_geometry
        ? JSON.parse(countyMetadata.wkb_geometry)
        : null;
      if (projectGeom?.type === GEOM_TYPES["Point"]) {
        const coordinates = projectGeom.coordinates;
        return new mapboxgl.LngLatBounds(coordinates, coordinates);
      } else if (projectGeom?.type === GEOM_TYPES["MultiLineString"]) {
        const coordinates = projectGeom.coordinates[0];
        return coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      } else if (projectGeom?.type === GEOM_TYPES["MultiPolygon"]) {
        const coordinates = projectGeom.coordinates[0][0];

        return coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      }
    } else {
      return undefined;
    }
  }, [projectIdFilterValue, data]);

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

    let range = getColorRange(5, "YlOrRd", false);
    if (variable === "AvgSpeed") {
      range = getColorRange(5, "RdYlGn", false);
    }
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

    if (projectCalculatedBounds) {
      newSymbology.fitToBounds = projectCalculatedBounds;
      newSymbology.fitZoom = 9.5;
    }
    else {
      newSymbology.fitToBounds = null;
      newSymbology.fitZoom = null;
    }


    if(!isEqual(newSymbology, tempSymbology)){
      setTempSymbology(newSymbology)
    }

  },[mapData, filters, timePeriod, functionalClass, variable, projectCalculatedBounds]);

  const idFilterOptions = areaOptions.map(fips => ({name: fips2Name[fips], id: fips})).sort((a,b) => {
    if (a.name < b.name) {
      return -1;
    }
    else if (b.name < a.name) {
      return 1;
    }
  }).map((v, i) => (
    <option key={`bpm_filter_option_${i}`} className="ml-2  truncate" value={v?.id}>
      {v.name} County -- {v.id}
    </option>
  ))


  return (
    <div className='flex justify-start content-center flex-wrap w-[85%] p-1'>
        <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">ID :</div>
        <div className="flex">
          <select
            className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
            value={projectIdFilterValue || ""}
            onChange={(e) => setFilters({ projectId: { value: e.target.value } })}
          >
            <option className="ml-2  truncate" value={""}>
              None
            </option>
            {idFilterOptions}
          </select>
        </div>
        <div className='flex py-3.5 px-2 text-sm text-gray-400 capitalize'>Variable : </div>
        <div className='flex'>
          <select
              className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
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
        <div className='flex py-3.5 px-2 text-sm text-gray-400 capitalize'>Time period : </div>
        <div className='flex'>
          <select
              className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
              value={timePeriod || ''}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.filter(d => d && d !== 'null').map((v,i) => (
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
        {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="flex px-2 ml-auto">
          <MapDataDownloader
            timePeriod={timePeriod}
            functionalClass={functionalClass}
            mapData={mapData}
            activeViewId={ activeViewId }
            activeVar={ variable }
          />
        </div>}

      </div>
  )


}
