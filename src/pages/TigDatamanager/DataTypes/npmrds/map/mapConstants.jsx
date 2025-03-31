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
        'visibility': 'none',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: npmrdsPaint
    }
  })


const NpmrdsLayers2 = ['allyears']
  .map(year => {
    return {
      "id": "s510_v476_tMultiLineString",
      "type": "line",
      "source": "tig_dama_dev_s510_v476_2023_1741874052524",
      "source-layer": "view_476",
      beneath: 'waterway-label',
      layout: {
        'visibility': 'none',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: npmrdsPaint
    }
  })


// const NpmrdsSources = [
//   { id: "npmrds",
//     source: {
//       type: "vector",
//       url: "https://tiles.availabs.org/data/npmrds.json"
//     }
//   }
// ]

const NpmrdsSources2 = 
  [
   {
      "id": "tig_dama_dev_s510_v476_2023_1741874052524",
      "source": {
         "type": "vector",
         "tiles": [
            "https://tig22.nymtc.org/graph/dama-admin/tig_dama_dev/tiles/476/{z}/{x}/{y}/t.pbf?cols=tmc&filter=year=2023"
         ],
         "format": "pbf"
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
  ...NpmrdsSources2,
  ...TrafficSignalsSources
]
const LAYERS = [
  // ...ConflationLayerCase,
  ...NpmrdsLayers2,
  // ...TrafficSignalsLayers,
]

export {LAYERS, LEGEND_RANGE, LEGEND_DOMAIN, npmrdsPaint, SOURCES}