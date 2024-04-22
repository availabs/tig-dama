import {useEffect, useContext} from "react";
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { NPMRDS_ATTRIBUTES } from "../constants";
import * as d3scale from "d3-scale"
import { useSearchParams } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store";
import get from "lodash/get";
import {
  falcorGraph,
} from "~/modules/avl-components/src"

const LEGEND_RANGE = ['rgb(255,0,0)', 'rgb(255,100,0)', 'rgb(255,255,0)', 'rgb(0,100,255)', 'rgb(0,0,255)', 'rgb(0,255,255)', 'rgb(0,255,0)']
const LEGEND_DOMAIN = [0, 10, 20, 30, 40, 50, 55];
const npmrdsPaint = {
  'line-color': '#ccc',
  'line-width': [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    [
      "match",
      ["get", "n"],
      [1, 2],
      0.5,
      0
    ],
    13,
    [
      "match",
      ["get", "n"],
      [1, 2],
      1.5,
      1
    ],
    18,
    [
      "match",
      ["get", "n"],
      [1, 2],
      8,
      5
    ]
  ],
  'line-opacity': [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    0.4,
    1
  ],
  'line-offset': {
    base: 1.5,
    stops: [[5, 0], [9, 1], [15, 3], [18, 7]]
  }
}

const NpmrdsLayers = ['2016','2017','2018','2019','2020','2021']
  .map(year => {
    return {
      id: `tmc-${year}`,
      type: 'line',
      source: 'npmrds',
      beneath: 'waterway-label',
      'source-layer': `npmrds_${year}`,
      layout: {
        'visibility': 'visible',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: npmrdsPaint
    }
  })



const NpmrdsSources = [
  { id: "npmrds",
    source: {
      type: "vector",
      url: "https://tiles.availabs.org/data/npmrds.json"
    }
  }
]
const TrafficSignalsSources = [
  { id: "traffic_signals",
    source: {
      type: "vector",
      url: "https://tiles.availabs.org/data/osm_traffic_signals.json"
    }
  }
]
const SOURCES = [
  ...NpmrdsSources,
  ...TrafficSignalsSources,
  {
      id: "geo-boundaries-source",
      source: {
          type: "geojson",
          data: {
              type: "FeatureCollection",
              features: []
          }
      }
  },
]
const LAYERS = [
  // ...ConflationLayerCase,
  ...NpmrdsLayers,
  // ...TrafficSignalsLayers,
  {
      id: "geo-boundaries",
      type: "line",
      source: "geo-boundaries-source",
      paint: {
          "line-color": "#fff"
      }
  }
]


const API_HOST = 'https://tigtest2.nymtc.org/api2/graph'
const tig_falcor = falcorGraph(API_HOST)
const GEO_LEVEL = 'COUNTY';
const npmrdsMapFilter = ({
  filters,
  setFilters,
  filterType = "mapFilter",
  tempSymbology, 
  setTempSymbology,
  activeViewId
}) => {

  const [searchParams] = useSearchParams();
  const activeDataVersionId = parseInt(searchParams.get("variable")) || activeViewId;
  let newSymbology = cloneDeep(tempSymbology);
  const year =  filters?.year?.value;
  const month = filters?.month?.value;
  const hour = filters?.hour?.value;
  const geoid = filters?.geoid?.value;
  useEffect(() => {
    const newFilters = {...filters};
    console.log(NPMRDS_ATTRIBUTES)
    if (!year) {
      newFilters.year = { value: NPMRDS_ATTRIBUTES['year'].values[0] }
    }
    if (!month){
      newFilters.month = {value : NPMRDS_ATTRIBUTES['month'].values[0]}
    }
    if(!hour){
      newFilters.hour = {value: NPMRDS_ATTRIBUTES['hour'].values[0]}
    }
    if(!geoid){
      newFilters.geoid = {value: NPMRDS_ATTRIBUTES['geoid'].values[0]}
    }
    setFilters(newFilters)
  }, []);

  const getColorScale = (domain) => {
    if (LEGEND_RANGE.length > domain.length) {
        domain = []
        return false
    }
    domain = [0, 10, 20, 30, 40, 50, 55]
    //ckmeans(domain,this.legend.range.length).map(d => Math.min(...d))
    //this.updateLegend(this.filters, this.legend)
    return d3scale.scaleThreshold()
        .domain(domain)
        .range(LEGEND_RANGE);
}

  useEffect(() => {
    async function getData() {    
      // geoids = filters.geography.domain.filter(d => d.name === filters.geography.value)[0].value,
      const geoDataPath = ["tig", "npmrds", `${month}|${year}`, `${GEO_LEVEL}|${geoid}`, "data"];
      const boundingGeometryPath = ["geo", GEO_LEVEL.toLowerCase(), "36061", "geometry"]
      const requests = [
        geoDataPath,
        boundingGeometryPath,
      ];
      // console.log({geometries})
      // console.log({requests})
      const response = await tig_falcor.get(...requests);
      const data = get(response, ['json', ...geoDataPath ])
      console.log("data::", data)
      console.log("newSymbology", newSymbology)
      if (!newSymbology?.source) {
        newSymbology.sources = SOURCES;
        const source_id = newSymbology?.sources?.[0]?.id || "0";
        const source_layer = `s${source_id}_v${activeDataVersionId}`;
        console.log("data inside setting source", data)

        const scale = d3scale.scaleThreshold()
          .domain(LEGEND_DOMAIN)
          .range(LEGEND_RANGE)

        const colors = Object.keys(data).reduce((a, c) => {
            let val = scale(get(data[c], `s[${hour}]`, 0))
            a[c] = val ? val : 'hsla(185, 0%, 27%,0.8)'
            return a;
        }, {});

        newSymbology.layers = LAYERS.map(layer => ({
          ...layer,
          ...(NPMRDS_ATTRIBUTES['year'].values.map(year => ({
            paint: {
              "line-color": [
                "case",
                ["has", ["to-string", ["get", 'tmc']], ["literal", colors]],
                ["get", ["to-string", ["get", 'tmc']], ["literal", colors]],
                "hsla(185, 0%, 27%,0.0)",
            ],
              "line-width": 3,
            }
          })))
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
        console.log(newSymbology)

        if (!isEqual(newSymbology, tempSymbology)) {
          console.log("setting new newSymbology");
          setTempSymbology(newSymbology);
        }

      }
    }

    if(year && month) {
      getData();
    }

  },[filters])





  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pt-1 pb-1 justify-start gap-y-2">
      {Object.keys(NPMRDS_ATTRIBUTES).filter(attrKey => NPMRDS_ATTRIBUTES[attrKey][filterType]).map(attrName => {
        return <FilterInput key={`filter_input_${attrName}`} setFilters={setFilters} filters={filters} name={attrName} attribute={NPMRDS_ATTRIBUTES[attrName]} value={filters[attrName]?.value || ""}/>
      })}
    </div>
  );
};

const FilterInput = ({ attribute, name, value, setFilters, filters }) => {
  const { values, type } = attribute;
  const inputValue = type === "range" ? value[0] : value;
  return (
    <div className="flex justify-start content-center flex-wrap">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        {name.split("_").join(" ")}:
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={inputValue}
          onChange={(e) =>
            setFilters({
              ...filters,
              [name]: { value: e.target.value },
            })
          }
        >
          {values?.map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export { npmrdsMapFilter };