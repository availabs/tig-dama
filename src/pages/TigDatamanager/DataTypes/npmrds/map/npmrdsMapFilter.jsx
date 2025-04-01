import {useEffect, useState, useContext} from "react";
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { NPMRDS_ATTRIBUTES } from "../constants";
import * as d3scale from "d3-scale"
import mapboxgl from "maplibre-gl";
import get from "lodash/get";
import { DamaContext } from "~/pages/DataManager/store"

import {LAYERS, LEGEND_RANGE, LEGEND_DOMAIN, SOURCES} from './mapConstants'
import { NpmrdsFilters } from "../filters";
const GEOM_TYPES = {
  LineString: "LineString",
};
const GEO_LEVEL = 'COUNTY';
//TODO
//How to get available months/years? tig22 doesn't list all months for all years
//What is `day of week`?
//What is `vehicle class`?
const npmrdsMapFilter = ({
  filters,
  setFilters,
  tempSymbology, 
  setTempSymbology,
  activeViewId,
  source
}) => {
  const { falcor, falcorCache, pgEnv } = useContext(DamaContext);
  const tig_falcor = falcor;
  const [allTmcs, setAllTmcs] = useState([]);
  const [tmcBounds, setTmcBounds] = useState();
  let newSymbology = cloneDeep(tempSymbology);
  const year =  filters?.year?.value;
  const month = filters?.month?.value;
  const hour = filters?.hour?.value;
  const direction = filters?.direction?.value;
  const tmc = filters?.tmc?.value;
  console.log("npmrds map filter",{activeViewId})
  useEffect(() => {
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: 2023 };
    }
    if (!month) {
      newFilters.month = { value:  NPMRDS_ATTRIBUTES["month"].values[1] };
    }
    if (!hour) {
      newFilters.hour = { value: NPMRDS_ATTRIBUTES["hour"].values[2] };
    }
    if (!direction) {
      newFilters.direction = {
        value: NPMRDS_ATTRIBUTES["direction"].values[0],
      };
    }
    if (!tmc) {
      newFilters.tmc = { value: "" };
    }
    setFilters(newFilters);
  }, []);

  // useEffect(() => {
  //   async function getTmcGeom() {
  //     const tmcGeometryPath = ["tmc", tmc, "year", year, "geometries"];
  //     let getTmcResponse = await tig_falcor.get(tmcGeometryPath);

  //     const tmcGeom = get(getTmcResponse, ["json", ...tmcGeometryPath]);
  //     console.log("filtered to geometries::", tmcGeom);
  //     if (tmcGeom?.type === GEOM_TYPES["LineString"]) {
  //       const coordinates = tmcGeom.coordinates;
  //       setTmcBounds(coordinates.reduce((bounds, coord) => {
  //         return bounds.extend(coord);
  //       }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])));
  //     }
  //   }

  //   if (tmc && tmc !== "") {
  //     getTmcGeom();
  //   }
  //   else{
  //     setTmcBounds();
  //   }
  // }, [tmc]);

  useEffect(() => {
    async function getData() {    
      // geoids = filters.geography.domain.filter(d => d.name === filters.geography.value)[0].value,

//npmrds_geometry_view_id 
//make a query to the backend using npmrds_tmc_meta_source_id
//Backend will find the tile info.
//['dama', pgEnv, 'npmrds','geometry', source?.metadata?.npmrds_tmc_meta_source_id, year]

    // replace the below with a call to dama options to the tmc_metadata view for prod
    // this call should take into account npmrds counties as a filter for this call
   // and should return just tmc 
   // use this route to get a list of TMCS from meta
   // dama[{keys:pgEnvs}].viewsbyId[{keys:viewIds}].options[{keys:options}].length
  // dama[{keys:pgEnvs}].viewsbyId[{keys:viewIds}].options[{keys:options}].databyIndex[{integers:indices}][{keys:attributes}]
    console.log(
      " source?.metadata?.npmrds_production_meta_view_id",
      source?.metadata?.npmrds_production_meta_view_id
    );

    const tmcListLengthPath = [
      "dama",
      pgEnv,
      "viewsbyId",
      '480',
      "data",
      "length"
    ];
    const lenRes = await falcor.get(tmcListLengthPath)

    let len = get(lenRes, ["json", ...tmcListLengthPath], 0);

    // // const test = await falcor.get(["dama", pgEnv, "viewsbyId", 476, "data", "length"])

    /**
     * TODO
     * if I switch to using the `options` route
     * I could filter tmcs by direction here
     */
    const tmcListDataPath = [
      "dama",
      pgEnv,
      "viewsbyId",
      '480',
      "databyIndex",
      { from: 0, to: len - 1 },
      ["tmc", "miles", "direction", "nhs", 'road', "avg_speedlimit"],
    ];

    const tmcIdRes = await falcor.get(tmcListDataPath);

    //Also applying direction filter here
    const tmcs = Object.values(
      get(
        tmcIdRes,
        ["json", "dama", pgEnv, "viewsbyId", "480", "databyIndex"],
        {}
      )
    ).filter(tmcRow => direction === "All" || tmcRow['direction']?.toLowerCase() === direction.toLowerCase());

    const tmcIds = tmcs.map((row) => row.tmc);
    //console.log("tmcIds", tmcIds);

    // use this view to get the npmrds data by hour for all tmcs 
    // routes[{keys:pgEnvs}].view[{integers:viewIds}].data[{keys:requestKeys}]

    /**
     * loop thru all tmcs, getting data for 500 at a time
     */
    /**
     * TODO -- month filter is a little tricky, because we have to pass exact dates...
     */
    const data = {};
    for(let i=0; i<(tmcIds.length+500); i=i+500) {
      const startEpoch = parseInt(hour) * 12;
      const endEpoch = (parseInt(hour)+1) * 12;
      const tmcDataReqKey = `${tmcIds.slice(i, i+500).join(",")}|20230101|20231231|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|travelTime|%7B%7D|ny`
      const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', tmcDataReqKey];
  
      const tmcDataRes = await falcor.get(tmcDataBasePath);
      //console.log("tmcDataRes new NEWNEW", tmcDataRes)

      const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', tmcDataReqKey])
      tmcData.reduce((acc, curr) => {
        const tmcMetaRow = tmcs.find(tmcRow => tmcRow.tmc === curr.tmc);
        const tmcLength = tmcMetaRow?.miles;
        //value is in seconds;
        //TODO VALIDATE THIS MATH??? maybe this is correct??
        const speed = (tmcLength / curr.value) * 60 * 60 ;

        acc[curr.tmc] = {...curr, speed, ...tmcMetaRow};


        return acc;
      }, data);
    }

    /*
    [["routes","data",
      "120P04992,120+04993,120P04993,120+04994,120P04994,120+04995,120P04995,120+04996,120P04996,120+04997,120P04997,120+04998,120P04998,120+04999,120P04999,120+05000,120P05000,120+05001,120P05001,120+05002,120P05002,120+05003,120P05003,120+05004,120P05004,120+05005,120P05005,120+05006,120P05006,120+05007,120P05007,120+05008,120P05008,120+05009,120P05009,120+05010,120P05010
      |20230201|20230228|0|288|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|none|%7B%7D|ny"]]
    */

      newSymbology.sources = SOURCES;
      newSymbology.data = data;

      setAllTmcs(Object.keys(data));
      const scale = d3scale.scaleThreshold()
        .domain(LEGEND_DOMAIN)
        .range(LEGEND_RANGE)

      const colors = Object.keys(data).reduce((a, c) => {
          const val = scale(get(data[c], `speed`, 0))
          a[c] = val ? val : 'hsla(185, 0%, 27%,0.8)'
          return a;
      }, {});
      newSymbology.layers = newSymbology.layers = [...(newSymbology.layers ?? LAYERS)].map(layer => ({
        ...layer,
          paint: {
            "line-color": [
              "case",
              ["has", ["to-string", ["get", 'tmc']], ["literal", colors]],
              ["get", ["to-string", ["get", 'tmc']], ["literal", colors]],
              "hsla(185, 0%, 27%,0.0)",
          ],
            "line-width": 3,
          },
          layout: {
            ...layer.layout,
            visibility:'visible' //layer.id.includes(year) ? 'visible' : 'none'
          }
      }));

      newSymbology.legend =  {
        type: "threshold",
        domain: LEGEND_DOMAIN,
        range: LEGEND_RANGE,
        format: ",.1f",
        direction: 'horizontal',
        show: false,
        units: "Average Speed (mph)"
      }

      //Determine which filters are active;
      const directionFilterActive = direction && direction.toLowerCase() !== "all";
      const filteredData = Object.keys(data)
        .filter((tmcId) => data[tmcId].direction === direction.substring(0, 1))
        .map((tmcId) => (tmcId))
      

      if (directionFilterActive) {
        newSymbology.filter = {};
        newSymbology.filter.dataIds = filteredData;
        newSymbology.filter.dataKey = "tmc"
      } else {
        newSymbology.filter = null;
      }
      if (tmcBounds) {
        newSymbology.fitToBounds = tmcBounds;
        newSymbology.fitZoom = 14.5;
      }
      else {
        newSymbology.fitToBounds = null;
        newSymbology.fitZoom = null;
      }


      if (!isEqual(newSymbology, tempSymbology)) {
        console.log("setting new newSymbology, newSymb layers");
        setTempSymbology(newSymbology);
      }

  
    }

    if(year && month) {
      console.log("gonna get some d ata")
      getData();
    }

  },[filters, tmcBounds]);

  const filterSettings = {
    ...NPMRDS_ATTRIBUTES, 
    tmc: {...NPMRDS_ATTRIBUTES.tmc, values: [""].concat(allTmcs)}
  };
  return <NpmrdsFilters filterSettings={filterSettings} filterType={"mapFilter"} filters={filters} setFilters={setFilters}/>
};

export { npmrdsMapFilter };