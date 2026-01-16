import React, {useEffect, useMemo} from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import mapboxgl from "maplibre-gl";
import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { getColorRange } from "~/modules/avl-components/src";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";
import { FilterControlContainer } from "../controls/FilterControlContainer";
import { DamaContext } from "~/pages/DataManager/store"
import { fips2Name } from '../constants';
import { variableAccessors, variableLabels } from "./BPMConstants";
const PIN_OUTLINE_LAYER_SUFFIX = '_pin_outline';
const NO_FILTER_LAYER_SUFFIX = '_static';
const SELECTED_BORDER_SUFFIX = '_selected_border';
import { Button } from "~/modules/avl-components/src"
import shpwrite from  '@mapbox/shp-write'
import { MultiLevelSelect } from '~/modules/avl-map-2/src';

const GEOM_TYPES = {
  Point: "Point",
  MultiLineString: "MultiLineString",
  MultiPolygon: "MultiPolygon",
};

const MAP_GEOM_VIEW_ID = 311; //prod value
//const MAP_GEOM_VIEW_ID = 383;
//1360?
//const MAP_GEOM_VIEW_ID = 1360;
// const MAP_GEOM_VIEW_ID = 1374; // replace with appropriate ${viewId} for environment

const MapDataDownloader = ({ activeViewId, activeVar,functionalClass,timePeriod,mapData  }) => {
  
  const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  const [loading, setLoading] = React.useState(true);

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
    <FilterControlContainer
      header={""}
      input={({ className }) => (
        <div>
          <Button
            themeOptions={{ size: "sm", color: "primary" }}
            onClick={downloadData}
            disabled={loading}
          >
            Download
          </Button>
        </div>
      )}
    />
  );
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
  // 12/02/25 update 2010 data is 1 row per combo, BUT 2012 does have this issue
  //We need to sum or average the data together
  const sumAll = filteredData.reduce((sumAll, d) => {
    const countyName = name2fips[d?.area];
    if(!sumAll[countyName]){
      sumAll[countyName] = {
        ...d,
        ogc_fid: d.ogc_fid,
        [variableAccessors.VMT]: 0,
        [variableAccessors.VHT]: 0,
        total_speed: 0,
        count: 0
      }
    }

    sumAll[countyName] = {
      ...d,
      [variableAccessors.VMT]: Number(d?.[variableAccessors.VMT]) + sumAll[countyName][variableAccessors.VMT] || 0,
      [variableAccessors.VHT]: Number(d?.[variableAccessors.VHT]) + sumAll[countyName][variableAccessors.VHT] || 0,
      total_speed: Number(d?.ave_speed) + sumAll[countyName].total_speed || 0,
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

  const areaOptions = Object.keys(formattedData); 

  /**
   * 
   * TODO reanme `projectIdFilterValue` here and in SED
   */

  const projectIdFilterValue = filters["projectId"]?.value || null;
  console.log({projectIdFilterValue})
  const projectCalculatedBounds = React.useMemo(() => {
    if (projectIdFilterValue) {
      const countyMetadata = data.find(d => d.geoid === projectIdFilterValue);

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

  const projectFilterOgcFid = useMemo(() => {
    return data.find(d => d.geoid === projectIdFilterValue)?.ogc_fid
  }, [projectIdFilterValue, data]);

  React.useEffect(() => {
    if(mapData && Object.keys(mapData).length > 0) {
      // const CountyValues = Object.values(filteredData)
      // filteredData should be shaped like
      /*
        {
          '36001': 55.44,
          '36036': 57.67
          ...
        }
    
      */

      /**
       * a domain with length 5 means there are 4 buckets (5 fenceposts = 4 lengths of fence)
       */
      const ckmeansLen = Math.min((Object.values(mapData) || []).length, 6);
      const values = Object.values(mapData || {});
      let domain = [0, 10, 25, 50, 75, 100];
      if (ckmeansLen <= values.length) {
        domain = ckmeans(values, ckmeansLen) || [];
      }

      const max = Math.max(...Object.values(mapData));
      //domain.push(max)
      if(domain[domain.length-1] !== max) {
        console.log("top of domain does not match max")
        domain[domain.length-1] = max;
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
        if(color === undefined) {
          color = range[range.length - 1]
        }
        return color;
      }

      const colors = {};
      Object.values(sumAll).forEach(geo => {
        colors[geo.geoid] = colorScale(domain, geo[variableAccessors[variable]]);
      })

      // Object.keys({...alGeoIdColor, ...mapData}).forEach((geoid) => {
      //   colors[geoid] = colorScale(domain, mapData[geoid]);
      // });
      //let output = ["get",["to-string",["get","ogc_fid"]], ["literal", colors]];
      //let output = ["get",["get","ogc_fid"], ["literal", colors]];
      let output = ["get",["to-string",["get","geoid"]], ["literal", colors]]
      //let output = ["coalesce", ["get",["to-string",["get","geoid"]], ["literal", colors]],"rgba(0,0,0,0)"]
      // console.log({layer})
      // newSymbology.layers = (layer?.layers || []).map((c) => {
      //   console.log({c})
      //   return {
      //     ...c,
      //     "fill-color": {
      //       [variable]: {
      //         type: 'threshold',
      //         settings: {
      //           range: range,
      //           domain: domain,
      //           title: variable
      //         },
      //         value: output
      //       }
      //     }
      //   };
      // });
      let highlightLayerInfo = {};
      newSymbology.layers = layer.layers.map((c, i) => {
        if(!c.id.includes(PIN_OUTLINE_LAYER_SUFFIX) && !c.id.includes(SELECTED_BORDER_SUFFIX)) {
          highlightLayerInfo = {...c}
        }

        const linePaint = {
          "line-color": "black",
          "line-width": 3,
          "line-opacity":1
        }

        const fillStyles = {
          "fill-color": {
            [variable]: {
              type: 'threshold',
              settings: {
                range: range,
                domain: domain,
                max,
                title: variableLabels[variable]
              },
              value: output
            }
          },
          "fill-opacity":{
            default: { value: 1 },
          },
        }

        return {
          ...c,
          paint: c.type === "line" ? linePaint : c.paint,
          id: c.id.includes(NO_FILTER_LAYER_SUFFIX) ? c.id : c.id + NO_FILTER_LAYER_SUFFIX,
          ...fillStyles,
          visibility: {
            //default: {value: projectFilterOgcFid ? "visible" : 'none'},
            default: {value: 'visible'},
          },
        };
      });
      if (newSymbology.layers.some((l) => l.id.includes(SELECTED_BORDER_SUFFIX))) {
        newSymbology.layers = newSymbology.layers.filter((l) => !l.id.includes(SELECTED_BORDER_SUFFIX));
      }
      const featureBorderFilter = areaOptions.reduce((acc, curr) => {
        if(curr === projectIdFilterValue) {
          acc[curr] = 3
        } else {
          acc[curr] = .5
        }
        return acc;
      }, {});
      console.log({featureBorderFilter})

      const highlightLayerId = highlightLayerInfo.id.replace(NO_FILTER_LAYER_SUFFIX, "") + SELECTED_BORDER_SUFFIX;
      const activeFeatureBorderFilter = ["get", ["to-string", ["get", "geoid"]], ["literal", featureBorderFilter]];
      newSymbology.layers.push({
        id: highlightLayerId,
        type: "line",
        source: highlightLayerInfo.source,
        "source-layer": highlightLayerInfo["source-layer"],
        "line-opacity": { default: { value: 0.8 }},
        "line-color": { default: { value: "black" }},
        "line-width": { default: { value: activeFeatureBorderFilter}},
        visibility: {
          //default: {value: projectFilterOgcFid ? "visible" : 'none'},
          default: {value: 'visible'},
        },
      });
      if (projectCalculatedBounds) {
        newSymbology.fitToBounds = projectCalculatedBounds;
        newSymbology.fitZoom = 9.5;
      }
      else {
        newSymbology.fitToBounds = null;
        newSymbology.fitZoom = null;
      }
      if(projectIdFilterValue) {
        //set symbology.filter, controls whether or not the `selectedBorder` layer appears
        const symbFilter = {
          dataKey: "ogc_fid",
          dataIds: [projectFilterOgcFid]
        }

        newSymbology.filter = symbFilter;
      }  else {
        newSymbology.filter = null;
      }
      if(!isEqual(newSymbology, tempSymbology)){
        console.log("bpm new symbology::", newSymbology)
        setTempSymbology(newSymbology)
      }
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

  console.log({areaOptions, projectIdFilterValue})
  return (
    <div className='flex justify-start content-center flex-wrap  p-1 w-[90%]'>
        <FilterControlContainer 
          header={'County:'}
          input={({className}) => (
            <MultiLevelSelect
              searchable={true}
              isMulti={false}
              placeholder={`Select a County...`}
              options={areaOptions}
              displayAccessor={(s) => fips2Name[s] + " County"}
              value={projectIdFilterValue || ""}
              onChange={(e) => setFilters({ projectId: { value: e } })}
              zIndex={999}
            />
          )}
        />
        <FilterControlContainer 
          header={'Variable:'}
          input={({className}) => (
            <select
                            className={className}
                value={variable || ''}
                onChange={(e) => setFilters({'activeVar' :{ value: e.target.value}})}
              >
                {variableClasses?.filter(d => d).map((v,i) => (
                  <option key={i} className="ml-2  truncate" value={v}>
                    {v}
                  </option>
                ))}
            </select>
          )}
        />
        <FilterControlContainer 
          header={'Time period:'}
          input={({className}) => (
            <select
                            className={className}
                value={timePeriod || ''}
                onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
              >
                {allTimePeriods?.filter(d => d && d !== 'null').map((v,i) => (
                  <option key={i} className="ml-2  truncate" value={v}>
                    {v?.replace("_"," ")}
                  </option>
                ))}
            </select>
          )}
        />
        <FilterControlContainer 
          header={'Functional class:'}
          input={({className}) => (
          <select
              className={className}
              value={functionalClass || ''}
              onChange={(e) => setFilters({'functional_class' :{ value: e.target.value}})}
            >
              {allFunctionalClasses?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
          )}
        />
        {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="px-2 ml-auto">
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
