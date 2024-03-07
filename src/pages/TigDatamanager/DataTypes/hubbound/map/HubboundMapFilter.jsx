import React, { useMemo, useEffect } from "react";
import { DamaContext } from "~/pages/DataManager/store";
import get from "lodash/get";
import { HubboundFilters } from "./hubboundFilters";
import { HUBBOUND_ATTRIBUTES, MAP_BOUNDS } from "../constants";
import { aggHubboundByLocation, createHubboundFilterClause } from "../utils";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import mapboxgl from "maplibre-gl";

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
      newFilters.hour = { value: [12, 12] }
    }    
    if (!transit_mode_name) {
      newFilters.transit_mode_name = { value: HUBBOUND_ATTRIBUTES['transit_mode_name'].values[6] }
    }
    if(!direction){
      newFilters.direction = { value: HUBBOUND_ATTRIBUTES['direction'].values[0] }
    } 
    setFilters(newFilters)
  }, []);

  const hubboundDetailsOptions = useMemo(() => {
    return createHubboundFilterClause(filters);
  }, [filters]);
  
  const hubboundDetailsPath = useMemo(() => {
    return [
      "dama",
      pgEnv,
      "viewsbyId",
      activeViewId,
      "options",
      hubboundDetailsOptions,
    ];
  }, [pgEnv, activeViewId, hubboundDetailsOptions]);

  const hubboundLocationsPath = [
    "dama",
    pgEnv,
    "hubbound",
    activeViewId,
    "locations",
  ];
  useEffect(() => {
    async function getHubboundLocations() {
      await falcor.get(hubboundLocationsPath);
    }

    getHubboundLocations();
  }, [hubboundLocationsPath]);

  useEffect(() => {
    async function fetchData() {
      console.log("getting view data");

      const lenRes = await falcor.get([...hubboundDetailsPath, "length"]);
      const len = get(lenRes, ["json", ...hubboundDetailsPath, "length"], 0);

      await falcor.get([
        ...hubboundDetailsPath,
        "databyIndex",
        {
          from: 0,
          to: len - 1,
        },
        Object.keys(HUBBOUND_ATTRIBUTES),
      ]);
    }

    if (year && hour && transit_mode_name && direction) {
      fetchData();
    }
  }, [pgEnv, activeViewId, hubboundDetailsOptions]);
  
  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});

    return Object.values(tableDataById);
  }, [activeViewId, falcorCache, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  const locationsData = useMemo(() => {
    const locations = get(falcorCache, hubboundLocationsPath, {});

    return locations?.value;
  }, [falcorCache, activeViewId]);

  useEffect(() => {
    if(locationsData && locationsData.length){
      const featObjs = aggHubboundByLocation(locationsData);
      const featArray = Object.keys(featObjs).map((featName) => ({
        name: featName,
        ...featObjs[featName],
      }));
  
      const source_layer_id = `s${source.source_id}_v${activeViewId}`;
  
      const newSource = {
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featArray,
          },
        },
        type: "geojson",
        id: source_layer_id,
      };
  
      newSymbology.sources = [newSource];
  
      const layer_layer_id = `${source_layer_id}_${"circle"}`;
  
      const newLayer = {
        id: layer_layer_id,
        ...mapStyle["circle"],
        source: source_layer_id
      };
  
      newSymbology.layers = [newLayer];

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
        console.log("setting new newSymbology, locationsData useEffect");
        setTempSymbology(newSymbology);
      }
    }
  }, [locationsData])

  useEffect(() => {
    if (tableData && tableData.length) {
      const dataObjs = aggHubboundByLocation(tableData);
      const activeLocationNames = Object.keys(dataObjs);
      newSymbology.filter = activeLocationNames;

      if (!isEqual(newSymbology, tempSymbology)) {
        console.log("setting new newSymbology, FILTER useEffect");
        setTempSymbology(newSymbology);
      }
    }
  }, [tableData, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  return (
    <div>
      <HubboundFilters filters={filters} setFilters={setFilters} />
    </div>
  );
};