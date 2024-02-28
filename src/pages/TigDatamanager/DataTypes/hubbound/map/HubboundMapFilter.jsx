import React, { useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store";
import get from "lodash/get";
import { HubboundTableFilter } from "../table/hubboundFilters";
import { HUBBOUND_ATTRIBUTES } from "../constants";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import mapboxgl from "maplibre-gl";
import { Button } from "~/modules/avl-components/src";
import shpwrite from "@mapbox/shp-write";
import { range as d3range } from "d3-array";

const mapStyle = {
  circle: {
    type: "circle",
    'paint': {
      'circle-radius': 6,
      'circle-color': '#B42222'
    },
  }
};


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

  console.log({filters});
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
  }, [activeViewId, falcorCache, hubboundDetailsPath]);

  useEffect(() => {
    console.log(tableData);

    if (tableData && tableData.length) {

      const featObjs = tableData.reduce((a, data) => {
        const { latitude: lat, longitude: lng, ...rest } = data;

        //for each lng, lon
        //route name : { [count_variable_name] : value }
        if (!a[data.in_station_name]) {
          a[data.in_station_name] = {
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
          !a[data.in_station_name]["properties"]["routes"][
            data.transit_route_name
          ]
        ) {
          a[data.in_station_name]["properties"]["routes"][
            data.transit_route_name
          ] = {};
        }

        a[data.in_station_name]["properties"]["routes"][
          data.transit_route_name
        ][data.count_variable_name] = data.count;

        return a;
      }, {})

      const featArray = Object.keys(featObjs).map(featName => ({name: featName, ...featObjs[featName]}))

      const newSource = {
        source:{
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featArray,
          },
        },
        type: "geojson",
        id: "0"
      };

      console.log("this is newSource",newSource);


      newSymbology.sources = [newSource];
      const source_id = newSymbology?.sources?.[0]?.id || "0";
      const source_layer = `s${source.source_id}_v${activeViewId}`;


      newSymbology.layers = ["circle"].map((type) => {
        return {
          id: `source_layer_${type}`,
          ...mapStyle[type],
          source: "0",
        };
      });

      if (!isEqual(newSymbology, tempSymbology)) {
        console.log("setting new newSymbology");
        setTempSymbology(newSymbology);
      }

    }
  }, [tableData]);

  //map.addSource('conferences', newSource);




  return <div>
    <div>Some Filters!</div>
    <HubboundTableFilter filters={filters} setFilters={setFilters}/>
    
    </div>;
};