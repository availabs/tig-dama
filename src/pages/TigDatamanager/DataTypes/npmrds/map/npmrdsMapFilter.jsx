import {useEffect, useState, useMemo} from "react";
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { NPMRDS_ATTRIBUTES } from "../constants";
import * as d3scale from "d3-scale"
import mapboxgl from "maplibre-gl";
import get from "lodash/get";
import {
  falcorGraph,
} from "~/modules/avl-components/src"

import {LAYERS, LEGEND_RANGE, LEGEND_DOMAIN, SOURCES} from './mapConstants'
import { NpmrdsFilters } from "../filters";
const GEOM_TYPES = {
  LineString: "LineString",
};
const API_HOST = 'https://tigtest2.nymtc.org/api2/graph'
const tig_falcor = falcorGraph(API_HOST)
const GEO_LEVEL = 'COUNTY';
//TODO
//How to get available months/years? tig22 doesn't list all months for all years
//What is `day of week`?
//What is `vehicle class`?
const npmrdsMapFilter = ({
  filters,
  setFilters,
  tempSymbology, 
  setTempSymbology
}) => {
  const [allTmcs, setAllTmcs] = useState([]);
  const [tmcBounds, setTmcBounds] = useState();
  let newSymbology = cloneDeep(tempSymbology);
  const year =  filters?.year?.value;
  const month = filters?.month?.value;
  const hour = filters?.hour?.value;
  const direction = filters?.direction?.value;
  const tmc = filters?.tmc?.value;

  useEffect(() => {
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: 2020 };
    }
    if (!month) {
      newFilters.month = { value:  NPMRDS_ATTRIBUTES["month"].values[5] };
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

      let requests = NPMRDS_ATTRIBUTES['counties'].values.reduce((a, c) => {
          a.push(['tig', 'npmrds', `${month}|${year}`, `${GEO_LEVEL}|${c}`, 'data'])
          // a.push(["geo", GEO_LEVEL.toLowerCase(), `${c}`, "geometry"]);
          return a;
      }, [])

      const response = await tig_falcor.get(...requests);
      const data = NPMRDS_ATTRIBUTES['counties'].values
        .map((d) =>
          get(
            response,
            [
              "json",
              "tig",
              "npmrds",
              `${month}|${year}`,
              `${GEO_LEVEL}|${d}`,
              "data",
            ],
            []
          )
        )
        .reduce((out, d) => ({ ...out, ...d }), {});

      newSymbology.sources = SOURCES;
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

      newSymbology.layers = [...(newSymbology.layers ?? LAYERS)].map(layer => ({
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
            visibility: layer.id.includes(year) ? 'visible' : 'none'
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
      getData();
    }

  },[filters, tmcBounds]);

  const filterSettings = {...NPMRDS_ATTRIBUTES, tmc: {...NPMRDS_ATTRIBUTES.tmc, values: [""].concat(allTmcs)}};
  return <NpmrdsFilters filterSettings={filterSettings} filterType={"mapFilter"} filters={filters} setFilters={setFilters}/>
};

export { npmrdsMapFilter };