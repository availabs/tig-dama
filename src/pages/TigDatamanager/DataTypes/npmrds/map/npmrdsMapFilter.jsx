import {useEffect, useState, useContext, useMemo} from "react";
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { NPMRDS_ATTRIBUTES } from "../constants";
import * as d3scale from "d3-scale"
import mapboxgl from "maplibre-gl";
import get from "lodash/get";
import { DamaContext } from "~/pages/DataManager/store"
import moment from 'moment'

import {LAYERS, LEGEND_RANGE, LEGEND_DOMAIN, SOURCES} from './mapConstants'
import { NpmrdsFilters } from "../filters";

const getInitialYearAndMonth = () => {
  const CURRENT_YEAR = new Date().getFullYear();
  const CURRENT_MONTH = new Date().getMonth() + 1;
  const CURRENT_DAY = new Date().getDate();
  console.log({CURRENT_YEAR, CURRENT_MONTH, CURRENT_DAY});

  //Want current year and month, unless day <= 21
    // Then, want previous month
  //Want current year, unless month === 1 AND day <= 21
    // Then, want previous year and month = 12

  if (CURRENT_MONTH === 1 && CURRENT_DAY <= 21) {
    return {
      year: CURRENT_YEAR - 1,
      month: 12
    }
  } 
  //TEMP until data is backfilled faster -- `current_day` portion will always fail
  //initially display previous month
  else {
    return {
      year: CURRENT_YEAR,
      month: CURRENT_MONTH - 1
    }
  }
  // else {
  //   return {
  //     year: CURRENT_YEAR,
  //     month: CURRENT_MONTH
  //   }
  // }
}


//TODO
//`day of week`?
//`vehicle class`?
const npmrdsMapFilter = ({
  filters,
  setFilters,
  tempSymbology, 
  setTempSymbology,
  activeViewId,
  source
}) => {
  const { falcor, falcorCache, pgEnv } = useContext(DamaContext);
  const [tmcBounds, setTmcBounds] = useState();
  let newSymbology = cloneDeep(tempSymbology);
  const year =  filters?.year?.value;
  const month = filters?.month?.value;
  const hour = filters?.hour?.value;
  const direction = filters?.direction?.value;
  const tmc = filters?.tmc?.value;

  useEffect(() => {
    const newFilters = { ...filters };
    const {
      year: initYear,
      month: initMonth
    } = getInitialYearAndMonth()
    if (!year) {
      newFilters.year = { value: initYear };
    }
    if (!month) {
      newFilters.month = { value:  initMonth };
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



  useEffect(() => {
    if (tmc && tmc !== "") {
      const curZoomTmc = tmcData.find((tmcRow) => tmcRow.tmc === tmc);
      const { start_longitude, start_latitude, end_longitude, end_latitude } =
        curZoomTmc;
      const startCoord = [start_longitude, start_latitude];
      const endCoord = [end_longitude, end_latitude];
      const coordinates = [startCoord, endCoord];
      setTmcBounds(
        coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
      );
    } else {
      setTmcBounds();
    }
  }, [tmc]);

  const tmcDataReqKey = useMemo(() => {
    const startOfMonth = moment([year, month - 1]).startOf('month').format('YYYYMMDD');
    const endOfMonth = moment([year, month - 1]).endOf('month').format('YYYYMMDD');
    const startEpoch = parseInt(hour) * 12;
    const endEpoch = (parseInt(hour)+1) * 12;
    return `${NPMRDS_ATTRIBUTES.counties.values.join(",")}|${startOfMonth}|${endOfMonth}|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|speed|%7B%7D|ny`
  },[year, month, hour])

  const tmcData = useMemo(
    () =>
      get(falcorCache, [
        "routes",
        pgEnv,
        "view",
        activeViewId,
        "data",
        tmcDataReqKey,
        "value",
      ]),
    [falcorCache, tmcDataReqKey]
  );

  useEffect(() => {
    async function getData() {    
      console.time("------TOTAL getting data and set style-----")
      // use this view to get the npmrds data by hour for all tmcs 
      // routes[{keys:pgEnvs}].view[{integers:viewIds}].data[{keys:requestKeys}]

      console.log("START req data for tmcs")
      const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', tmcDataReqKey];
      console.time("just data REQ")
      const tmcDataRes = await falcor.get(tmcDataBasePath);
      console.timeEnd("just data REQ")
      const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', tmcDataReqKey])
      const data = {};
      // console.time("tmc data reduce")
      tmcData.reduce((acc, curr) => {
        acc[curr.tmc] = {...curr};
        return acc;
      }, data);
      // console.timeEnd("tmc data reduce")
      console.log("data for tmcs fetched")
      newSymbology.sources = SOURCES;
      newSymbology.data = data;

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
            visibility: 'visible' //layer.id.includes(year) ? 'visible' : 'none'
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
      console.timeEnd("------TOTAL getting data and set style-----")
    }
    if(year && month) {
      console.log("gonna get some data")
      getData();
    }

  },[year, month, hour, direction]);

  useEffect(() => {
    if (tmcBounds) {
      newSymbology.fitToBounds = tmcBounds;
      newSymbology.fitZoom = 14.5;
    }
    else {
      newSymbology.fitToBounds = null;
      newSymbology.fitZoom = null;
    }

    if (!isEqual(newSymbology, tempSymbology)) {
      console.log("setting new newSymbology, tmcBounds");
      setTempSymbology(newSymbology);
    }
  }, [tmcBounds]);

  const filterSettings = {
    ...NPMRDS_ATTRIBUTES, 
    tmc: {...NPMRDS_ATTRIBUTES.tmc, values: [""].concat(tmcData?.map(tmcRow => tmcRow.tmc))}
  };
  return <NpmrdsFilters filterSettings={filterSettings} filterType={"mapFilter"} filters={filters} setFilters={setFilters}/>
};

export { npmrdsMapFilter };