const formatHour = (element) => {
  if(element.toString().length > 1){
    //two digit hour
    return `${element}:00`
  }
  else {
    //one digit hour
    return `0${element}:00`
  }
}

const BAR_CHART_PROPS = {
  keys: ["value"],
  valueFormat: (value) => value.toLocaleString(),
  indexBy: "id",
  margin: { top: 10, right: 30, bottom: 95, left: 150 },
  pixelRatio: 2,
  padding: 0.15,
  innerPadding: 0,
  minValue: "auto",
  maxValue: "auto",
  groupMode: "stacked",
  layout: "horizontal",
  reverse: false,
  valueScale: { type: "linear" },
  indexScale: { type: "band", round: true },
  colors: { scheme: "category10" },
  borderColor: {
    from: "color",
    modifiers: [
      ["darker", 0.6],
      ["opacity", 0.5],
    ],
  },
  axisBottom: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legendPosition: "middle",
    legendOffset: 36,
  },
  axisLeft: {
    showGridLines: false,
    tickDensity: 1,
    tickRotation: 310
  },
  enableGridX: true,
  enableGridY: false,
  enableLabel: true,
  labelSkipWidth: 32,
  labelSkipHeight: 32,
  labelTextColor: {
    from: "color",
    modifiers: [["darker", 1.6]],
  },
  isInteractive: true,
  legends: [],
};

const LINE_GRAPH_PROPS = {
  colors: [
    "#3366cc",
    "#dc3912",
    "#ff9900",
    "#109618",
    "#990099",
    "#0099c6",
    "#dd4477",
    "#66aa00",
    "#b82e2e",
    "#316395",
    "#994499",
    "#22aa99",
    "#aaaa11",
    "#6633cc",
    "#e67300",
    "#8b0707",
    "#651067",
    "#329262",
    "#5574a6",
    "#3b3eac",
    "#b77322",
    "#16d620",
    "#b91383",
    "#f4359e",
    "#9c5935",
    "#a9c413",
    "#2a778d",
    "#668d1c",
    "#bea413",
    "#0c5922",
    "#743411",
  ],
  axisBottom: {
    tickDensity: 4,
    format: formatHour,
    label: "Hour",
    legendPosition: "middle",
  },
  axisLeft: {
    label: "Values",
    showGridLines: false,
    tickDensity: 1,
  },
  axisRight: {
    label: "Year",
    showGridLines: false,
  },
  hoverComp: {
    idFormat: (id, data) => data.name,
    xFormat: formatHour,
    yFormat: ",.2f",
    showTotals: false,
  },
  margin: {
    top: 20,
    bottom: 55,
    left: 80,
    right: 30,
  },
};

const CHART_TYPES = ["bar", "line"];
const AGGREGATION_TYPES = ["Average", "Sum"];
const SERIES_TYPES = ["sector_name", "transit_mode_name", "direction"];

export {
  BAR_CHART_PROPS,
  LINE_GRAPH_PROPS,
  CHART_TYPES,
  AGGREGATION_TYPES,
  SERIES_TYPES,
};
