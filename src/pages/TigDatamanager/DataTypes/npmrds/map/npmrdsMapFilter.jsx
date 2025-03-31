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
      newFilters.year = { value: 2024 };
    }
    if (!month) {
      newFilters.month = { value:  NPMRDS_ATTRIBUTES["month"].values[1] };
    }
    if (!hour) {
      newFilters.hour = { value: NPMRDS_ATTRIBUTES["hour"].values[0] };
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

  useEffect(() => {
    async function getTmcGeom() {
      const tmcGeometryPath = ["tmc", tmc, "year", year, "geometries"];
      let getTmcResponse = await tig_falcor.get(tmcGeometryPath);

      const tmcGeom = get(getTmcResponse, ["json", ...tmcGeometryPath]);
      console.log("filtered to geometries::", tmcGeom);
      if (tmcGeom?.type === GEOM_TYPES["LineString"]) {
        const coordinates = tmcGeom.coordinates;
        setTmcBounds(coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])));
      }
    }

    if (tmc && tmc !== "") {
      getTmcGeom();
    }
    else{
      setTmcBounds();
    }
  }, [tmc]);

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

    const tileResp = await tig_falcor.get([
      "dama",
      pgEnv,
      "npmrds",
      "geometry",
      source?.metadata?.npmrds_tmc_meta_source_id,
      year,
    ]);

    const tileData =           get(
      tileResp,
      [
        "json",
        "dama",
        pgEnv,
        "npmrds",
        "geometry",
        source?.metadata?.npmrds_tmc_meta_source_id,
      ],
      {}
    )

    // use this view to get the npmrds data by hour for all tmcs 
    // routes[{keys:pgEnvs}].view[{integers:viewIds}].data[{keys:requestKeys}]
    /*

    [["routes","data",
      "120P04992,120+04993,120P04993,120+04994,120P04994,120+04995,120P04995,120+04996,120P04996,120+04997,120P04997,120+04998,120P04998,120+04999,120P04999,120+05000,120P05000,120+05001,120P05001,120+05002,120P05002,120+05003,120P05003,120+05004,120P05004,120+05005,120P05005,120+05006,120P05006,120+05007,120P05007,120+05008,120P05008,120+05009,120P05009,120+05010,120P05010
      |20230201|20230228|0|288|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|none|%7B%7D|ny"]]
    */
    let requests = NPMRDS_ATTRIBUTES['counties'].values.reduce((a, c) => {
          a.push(['dama', pgEnv, 'npmrds', source?.source_id, activeViewId, `${month}|${year}`, `${GEO_LEVEL}|${c}`, 'data'])
          // a.push(["geo", GEO_LEVEL.toLowerCase(), `${c}`, "geometry"]);
          return a;
      }, [])

      
      const response = await tig_falcor.get(...requests);
      const data = NPMRDS_ATTRIBUTES["counties"].values
        .map((d) =>
          get(
            response,
            [
              "json",
              "dama",
              pgEnv,
              "npmrds",
              source?.source_id,
              activeViewId,
              `${month}|${year}`,
              `${GEO_LEVEL}|${d}`,
              "data",
            ],
            []
          )
        )
        .reduce((out, d) => ({ ...out, ...d }), {});
      /*
       data = {
        // tmc id
        "NP1050603" : [65.2,61,60 ... 64.2] //length 24
        ...
      }
      */

      const featArray = Object.keys(data).map(tmc => {
        const d = data[tmc];
        const {geometry, ...rest} = d;
        return {
          type: "Feature",
          id:tmc,
          name: tmc,
          properties: {
            tmc,
            geoid: tmc,
            ...rest,
          },
          geometry: geometry,
        }
      
      }).filter(feat => Object.keys(feat.geometry).length !== 0);

      const source_layer_id = `s${source.source_id}_v${activeViewId}`;
      const newSource = {
        id: source_layer_id,
        source: {
          type: "geojson",
          data: {
            type:"FeatureCollection",
            features: featArray,
          }
        },
        type: "geojson",
      };
      console.log("newSource::", newSource)
      newSymbology.sources = [newSource];
      newSymbology.data = data;

      setAllTmcs(Object.keys(data));
      const scale = d3scale.scaleThreshold()
        .domain(LEGEND_DOMAIN)
        .range(LEGEND_RANGE)

      const colors = Object.keys(data).reduce((a, c) => {
          const val = scale(get(data[c], `s[${hour}]`, 0))
          a[c] = val ? val : 'hsla(185, 0%, 27%,0.8)'
          return a;
      }, {});
      const layer_layer_id = `${source_layer_id}_${"line"}`;
      // const newLayer = {
      //   id: layer_layer_id,
      //   source: source_layer_id,
      //   type:"line",
      //   paint: {
      //     "line-color": [
      //       "case",
      //       ["has", ["to-string", ["get", 'tmc']], ["literal", colors]],
      //       ["get", ["to-string", ["get", 'tmc']], ["literal", colors]],
      //       "hsla(185, 0%, 27%,0.0)",
      //   ],
      //     "line-width": 3,
      //   },
      //   layout: {
      //     visibility: 'visible'
      //   }
      // };

      const initialLayers = tileData.layers;
      console.log("newSymbology.layers::",initialLayers);
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
            visibility:'visble' //layer.id.includes(year) ? 'visible' : 'none'
          }
      })); //[newLayer]


      newSymbology.legend =  {
        type: "threshold",
        domain: LEGEND_DOMAIN,
        range: LEGEND_RANGE,
        format: ",.1f",
        direction: 'horizontal',
        show: false,
        units: "Average Speed (mph)"
      }

      // newSymbology.sources.push({
      //   id: "geo-boundaries-source",
      //   source: {
      //     type: "geojson",
      //     data: {
      //       type: "FeatureCollection",
      //       features: NPMRDS_ATTRIBUTES['counties'].values.map((f) => ({
      //         type: "Feature",
      //         properties: { geoid: f },
      //         geometry: get(
      //           response,
      //           ["geo", GEO_LEVEL.toLowerCase(), `${f}`, "geometry", "value"],
      //           null
      //         ),
      //       })),
      //     },
      //   },
      // });

      // newSymbology.layers.push({
      //   id: "geo-boundaries",
      //   type: "line",
      //   source: "geo-boundaries-source",
      //   paint: {
      //     "line-color": "#000000",
      //     "line-width": 10,
      //   },
      //   layout: {
      //     visibility:'visible'
      //   }
      // });


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