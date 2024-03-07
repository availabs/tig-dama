import React, { useMemo } from "react";
import { get, sum, mean } from "lodash";
import { useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import download from "downloadjs";

import { Button } from "~/modules/avl-components/src";
import { fips2Name, regionalData } from "../../constants";
import { HUBBOUND_ATTRIBUTES } from "../constants";

const CHART_TYPES = ["bar", "line"];
const AGGREGATION_TYPES = ["avg", "sum"];
const SERIES_TYPES = ["sector_name", "transit_mode_name", "direction"];

export const HubboundChartFilters = ({
  filters,
  setFilters,
  variables,
  years,
  node,
}) => {
  let chartType = useMemo(() => get(filters, "chartType.value", ""), [filters]);
  let aggregation = useMemo(() => get(filters, "aggregation.value", "all"), [filters]);
  let series = useMemo(() => get(filters, "series.value", ""), [filters]);

  const downloadImage = React.useCallback(() => {
    console.log("Called download");
    if (!node) return;
    toPng(node, { backgroundColor: "#fff" }).then((dataUrl) => {
      download(dataUrl, `${activeVar}.png`, "image/png");
    });
  }, [node, filters]);

  return (
    <div className="flex justify-start content-center flex-wrap">
      <Button
        themeOptions={{ size: "sm", color: "primary" }}
        onClick={downloadImage}
      >
        Download
      </Button>
      <div className="py-2 px-2 text-sm text-gray-400">Chart Type: </div>
      <div className="flex-1" >
        <select
          className="py-2 w-[200px] border border-blue-100 bg-blue-50 w-full bg-white items-center justify-between text-sm"
          value={chartType}
          onChange={(e) =>
            setFilters({
              ...filters,
              chartType: { value: e.target.value },
            })
          }
        >
          {(CHART_TYPES || []).map((cType, i) => (
            <option key={i} className="ml-2 truncate" value={cType}>
              {cType}
            </option>
          ))}
        </select>
      </div>
      <div className="py-2 px-2 text-sm text-gray-400">Aggregation</div>
      <div className="flex-1" >
        <select
          className="py-2 w-[200px] border border-blue-100 bg-blue-50 w-full bg-white items-center justify-between text-sm"
          value={aggregation}
          onChange={(e) =>
            setFilters({
              ...filters,
              aggregation: { value: e.target.value },
            })
          }
        >
          {(AGGREGATION_TYPES || []).map((aType, i) => (
            <option key={i} className="ml-2 truncate" value={aType}>
              {aType}
            </option>
          ))}
        </select>
      </div>
      <div className="py-2 px-2 text-sm text-gray-400">Series</div>
      <div className="flex-1" >
        <select
          className="py-2 w-[200px] border border-blue-100 bg-blue-50 w-full bg-white items-center justify-between text-sm"
          value={series}
          onChange={(e) =>
            setFilters({
              ...filters,
              series: { value: e.target.value },
            })
          }
        >
          {(SERIES_TYPES || []).map((sType, i) => (
            <option key={i} className="ml-2 truncate" value={sType}>
              {sType}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};


export const HubboundChartTransform = ({ tableData, filters, chartFilters }) => {
  console.log("HubboundChartTransform", { tableData, filters, chartFilters });
  const series = chartFilters?.series?.value;

  const data = Object.values(tableData).reduce((a, tData) => {
    //for each lng, lon
    //route name : { [count_variable_name] : value }
    const curSeriesValue = tData[series];
    const curHourValue = tData['hour']
    if(!a[curSeriesValue]){
      a[curSeriesValue] = {
        id: curSeriesValue,
        name: curSeriesValue,
        data: {} //TODO convert this in another loop, from {hour: {x: hour, y: count}} to: [{x: hour, y: count}]
      };
    }

    if(!a[curSeriesValue].data[curHourValue]){
      //If we haven't seen this hour yet, initialzie
      a[curSeriesValue].data[curHourValue] = {x: curHourValue, y:0}
    }

    //RYAN TODO change this from hardcoded sum, to dynamic sum or average
    a[curSeriesValue].data[curHourValue]['y'] += tData['count']
    
    return a;
  }, {})
  console.log(data)
  const transformedData = Object.values(data).map(seriesData => ({...seriesData, data: Object.values(seriesData.data)}));
  //aggregate based on chartFilters.series
  console.log(transformedData)
  //One top-level element per unique series
  //Each series has data array, with x=hour, y=chartFilter.count_variable_name (`count` is what holds the data)

  //DESIRED SHAPE:
  //x is `hour`, y is sum/avg
  //id is "series": could be "direction", "sector", or "mode"
   
  // [
  //   {
  //     id: "outbound",
  //     name: "outbound",
  //     data:[{x: val, y:val}]
  //   }
  //   {
  //     id: "inbound",
  //     name: "inbound",
  //     data:[{x: val, y:val}]
  //   }
  // ]

  return {
    data: transformedData,
  };
};
