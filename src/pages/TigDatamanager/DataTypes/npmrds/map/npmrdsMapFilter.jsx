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
  const [allTmcRows, setAllTmcRows] = useState([]);
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
      newFilters.year = { value: 2023 };
    }
    if (!month) {
      newFilters.month = { value:  NPMRDS_ATTRIBUTES["month"].values[0] };
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
  const metaLayerViewId = useMemo(() => {
    if(year) {
      return source?.metadata?.npmrds_meta_layer_view_id[year] ?? source?.metadata?.npmrds_meta_layer_view_id?.[2017]; //TODO temp hardcode for testing data
    }
  }, [year]);

  useEffect(() => {
    const getTmcMetaData = async () => {
      console.log("getting tmc metadata")
      const tmcListLengthPath = [
        "dama",
        pgEnv,
        "viewsbyId",
        metaLayerViewId,
        "data",
        "length"
      ];
      const lenRes = await falcor.get(tmcListLengthPath)
  
      let len = get(lenRes, ["json", ...tmcListLengthPath], 0);
 
      /**
       * TODO
       * if I switch to using the `options` route
       * I could filter tmcs by direction here
       */
      const tmcListDataPath = [
        "dama",
        pgEnv,
        "viewsbyId",
        metaLayerViewId,
        "databyIndex",
        { from: 0, to: len - 1 },
        ["tmc", "miles", "direction", "nhs", 'road', "avg_speedlimit", "start_latitude",	"start_longitude",	"end_latitude",	"end_longitude"],
      ];
  
      const tmcIdRes = await falcor.get(tmcListDataPath);
      
      const tmcs = Object.values(
        get(
          tmcIdRes,
          ["json", "dama", pgEnv, "viewsbyId", metaLayerViewId, "databyIndex"],
          {}
        )
      );
      setAllTmcRows(tmcs)
    }

    if(metaLayerViewId) {
      getTmcMetaData();
    }

  }, [metaLayerViewId]);


  useEffect(() => {
    if (tmc && tmc !== "") {
      const tmcs = Object.values(get(falcorCache, ["dama", pgEnv, "viewsbyId", metaLayerViewId, "databyId"], {})).filter(
        (tmcRow) => direction === "All" || tmcRow["direction"]?.toLowerCase() === direction?.toLowerCase()
      );
      const curZoomTmc = tmcs.find((tmcRow) => tmcRow.tmc === tmc);
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

  useEffect(() => {
    async function getData() {    


      // use this view to get the npmrds data by hour for all tmcs 
      // routes[{keys:pgEnvs}].view[{integers:viewIds}].data[{keys:requestKeys}]

      console.log({year, month})

      const startOfMonth = moment([year, month - 1]).startOf('month').format('YYYYMMDD');
      const endOfMonth = moment([year, month - 1]).endOf('month').format('YYYYMMDD');

      const data = {};
      console.log("retreiving data for tmcs")
      const startEpoch = parseInt(hour) * 12;
      const endEpoch = (parseInt(hour)+1) * 12;
      const tmcDataReqKey = `${NPMRDS_ATTRIBUTES.counties.values.join(",")}|${startOfMonth}|${endOfMonth}|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|travelTime|%7B%7D|ny`
      const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', tmcDataReqKey];
      const tmcDataRes = await falcor.get(tmcDataBasePath);
      const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', tmcDataReqKey])
      tmcData.reduce((acc, curr) => {
        const tmcMetaRow = allTmcRows.find(tmcRow => tmcRow.tmc === curr.tmc);
        const tmcLength = tmcMetaRow?.miles;

        //value is in seconds;
        //TODO VALIDATE THIS MATH??? maybe this is correct??
        const speed = (tmcLength / curr.value) * 60 * 60 ;
        if( direction === "All" || tmcMetaRow["direction"]?.toLowerCase() === direction?.toLowerCase()) {
          acc[curr.tmc] = {...curr, speed, ...tmcMetaRow};
        }
        return acc;
      }, data);
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
    }

    if(year && month && allTmcRows.length) {
      console.log("gonna get some data")
      getData();
    }

  },[year, month, hour, direction, allTmcRows]);

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
    tmc: {...NPMRDS_ATTRIBUTES.tmc, values: [""].concat(allTmcRows.map(tmcRow => tmcRow.tmc))}
  };
  return <NpmrdsFilters filterSettings={filterSettings} filterType={"mapFilter"} filters={filters} setFilters={setFilters}/>
};

export { npmrdsMapFilter };