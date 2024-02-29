import React, { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store";
import get from "lodash/get";
import { HubboundTableFilter } from "../table/hubboundFilters";
import { HUBBOUND_ATTRIBUTES, MAP_BOUNDS } from "../constants";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import mapboxgl from "maplibre-gl";

const FILTERS_TO_EXCLUDE = [
  "sector_name",
  "transit_agency_name",
  "transit_route_name",
  "out_station_name",
  "in_station_name",
  "location_name",
  "count_variable_name",
  "latitude",
  "longitude",
  "count",
];
const colors = {
  "Staten Island": "rgb(255, 0, 255)",
  "Queens":"rgb(0, 0, 255)",
  "New Jersey": "rgb(255, 0, 0)",
  "Brooklyn":"rgb(0, 255, 0)",
  "60th Street Sector":"rgb(0, 255, 255)"
} 

const mapStyle = {
  circle: {
    type: "circle",
    'paint': {
      'circle-radius': 6,
      'circle-color': ["get", ["to-string", ["get", "sector_name"]], ["literal", colors]]
    },
  },
  line: {
    type: 'line',
    paint: {
        'line-color': 'black',
        'line-width': 1,
        'line-dasharray': [10, 5]
    }
  }
};

//TODO -- change `hour` to be a "range". It is a set of discrete values, we can send a range
//TODO -- Can maybe `group by`, do some agg on the backend. If not,  can just sum client side
//TODO -- map filter should take in prop that handles which filters should be enabled
/**
 * RYAN TODO -- may need to come back and add a 2nd layer for county geom
 * Otherwise, this will just show dots
 */
export const HubboundMapFilter = (props) => {
  const {
    source,
    metaData,
    filters,
    setFilters,
    setTempSymbology,
    tempSymbology,
    activeViewId,
    layer,
  } = props;
  let newSymbology = cloneDeep(tempSymbology);
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);

  const year =  filters?.year?.value;
  const hour = filters?.hour?.value;
  const transit_mode_name = filters?.transit_mode_name?.value;
  const direction = filters?.direction?.value;

  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value: 2019 }
    }  
    if (!hour) {
      newFilters.hour = { value: 12 }
    }    
    if (!transit_mode_name) {
      newFilters.transit_mode_name = { value: HUBBOUND_ATTRIBUTES['transit_mode_name'].values[0] }
    }
    if(!direction){
      newFilters.direction = { value: HUBBOUND_ATTRIBUTES['direction'].values[0] }
    } 
    setFilters(newFilters)
  }, []);

  const hubboundDetailsOptions = useMemo(() => {
    const filterClause = Object.keys(filters).reduce((a,c) => {
      if(filters[c].value && filters[c].value !== "all"){
        a[c] = [filters[c].value];
      }


      return a;
    }, {});

    return JSON.stringify({
      filter: filterClause,
    });
  }, [filters]);

  const hubboundDetailsPath = useMemo(() => {
    return [
      "dama",
      pgEnv,
      "viewsbyId",
      activeViewId,
      "options",
      hubboundDetailsOptions,
    ]
  }, [pgEnv, activeViewId, hubboundDetailsOptions] )

  useEffect(() => {
    async function fetchData() {
      console.log("getting view data")
  
      const lenRes = await falcor.get([...hubboundDetailsPath, 'length']);
      const len = get(lenRes, ['json', ...hubboundDetailsPath, 'length'], 0);
  
      await falcor.get([...hubboundDetailsPath, 'databyIndex', {
          from: 0,
          to: len - 1
      }, Object.keys(HUBBOUND_ATTRIBUTES)]);
    }

    if(year && hour && transit_mode_name && direction){
      fetchData();
    }

  }, [pgEnv, activeViewId, hubboundDetailsOptions])
  
  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});

    return Object.values(tableDataById);
  }, [activeViewId, falcorCache, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  useEffect(() => {
    if (tableData && tableData.length) {
      const featObjs = tableData.reduce((a, data) => {
        const { latitude: lat, longitude: lng, ...rest } = data;

        //for each lng, lon
        //route name : { [count_variable_name] : value }
        if (!a[data.location_name]) {
          a[data.location_name] = {
            type: "Feature",
            properties: {
              ...rest,
              routes: {},
            },
            geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          };
        }

        if (
          !a[data.location_name]["properties"]["routes"][
            data.transit_route_name
          ]
        ) {
          a[data.location_name]["properties"]["routes"][
            data.transit_route_name
          ] = {};
        }

        a[data.location_name]["properties"]["routes"][
          data.transit_route_name
        ][data.count_variable_name] = data.count;

        return a;
      }, {})

      const featArray = Object.keys(featObjs).map(featName => ({name: featName, ...featObjs[featName]}));
      const source_layer_id = `s${source.source_id}_v${activeViewId}`;
      const newSource = {
        source:{
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featArray,
          },
        },
        type: "geojson",
        id: source_layer_id
      };

      newSymbology.sources = [newSource];

      newSymbology.layers = ["circle"].map((type) => {
        return {
          id: `source_layer_${type}`,
          ...mapStyle[type],
          source: source_layer_id,
          path: hubboundDetailsPath
        };
      });

      const countySourceId = 'counties_source';
      if(!newSymbology.sources.find(source => source.id === countySourceId)){
        console.log("adding county source")
        const countySource = {
          source:{
            type: 'geojson',
            data: '/data/hubbound.json'
          },
          url:'/data/hubbound.json',
          type: "geojson",
          id: countySourceId
        };
        newSymbology.sources.push(countySource);
      }

      if(!newSymbology.layers.find(layer => layer.id === 'counties_layer')){
        console.log("adding county layer")
        const countyLayer = {
          id: `counties_layer`,
          ...mapStyle['line'],
          source: countySourceId
        };
        newSymbology.layers.push(countyLayer);
      }


      const projectCalculatedBounds = new mapboxgl.LngLatBounds(
        MAP_BOUNDS[0],
        MAP_BOUNDS[1]
      );
      
      newSymbology.fitToBounds = projectCalculatedBounds;
      newSymbology.fitZoom = 12;

      if (!isEqual(newSymbology, tempSymbology)) {
        console.log("setting new newSymbology");
        setTempSymbology(newSymbology);
      }

    }
  }, [tableData, hubboundDetailsPath, hubboundDetailsOptions, filters]);
  return <div>
      <HubboundTableFilter filters={filters} setFilters={setFilters} filtersToExclude={FILTERS_TO_EXCLUDE}/>
    </div>;
};