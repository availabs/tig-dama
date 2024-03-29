import React, { useMemo } from "react";
import { get } from "lodash";
import { toPng } from "html-to-image";
import download from "downloadjs";

import { Button } from "~/modules/avl-components/src";
import { CHART_TYPES, AGGREGATION_TYPES, SERIES_TYPES } from "./chartConstants";

export const HubboundChartFilters = ({
  filters,
  setFilters,
  node,
}) => {
  let chartType = useMemo(() => get(filters, "chartType.value", ""), [filters]);
  let aggregation = useMemo(() => get(filters, "aggregation.value", ""), [filters]);
  let series = useMemo(() => get(filters, "series.value", ""), [filters]);

  const downloadImage = React.useCallback(() => {
    console.log("Called download");
    if (!node) return;
    toPng(node, { backgroundColor: "#fff" }).then((dataUrl) => {
      download(dataUrl, `${chartType}_${aggregation}_${series}.png`, "image/png");
    });
  }, [node, filters]);

  return (
    <div className="flex justify-start content-center flex-wrap w-full mt-4">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Chart Type:</div>
      <div className="flex" >
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={chartType}
          onChange={(e) =>
            setFilters({
              ...filters,
              chartType: { value: e.target.value },
            })
          }
        >
          {(CHART_TYPES || []).map((cType, i) => (
            <option key={i} className="ml-2 truncate " value={cType}>
              {cType}
            </option>
          ))}
        </select>
      </div>
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Aggregation:</div>
      <div className="flex" >
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
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
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Series:</div>
      <div className="flex" >
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
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
              {sType.split("_").join(" ")}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto mr-2">
        <Button
          themeOptions={{ size: "sm", color: "primary" }}
          onClick={downloadImage}
          
        >
          Download
        </Button>
      </div>
    </div>
  );
};

export const HubboundChartTransform = ({ tableData, filters, chartFilters }) => {
  const chartType = chartFilters?.chartType?.value;
  const series = chartFilters?.series?.value;
  const aggregation = chartFilters?.aggregation?.value;

  if(chartType === "bar"){
    const data = Object.values(tableData).reduce((a, tData) => {
      const curSeriesValue = tData[series];
      if (!a[curSeriesValue]) {
        a[curSeriesValue] = {
          id: curSeriesValue,
          name: curSeriesValue,
          value: 0,
          numVal: 0,
        };
      }

      a[curSeriesValue]["value"] += tData["count"];
      a[curSeriesValue]["numVal"]++;

      return a;
    }, {});
    const transformedData = Object.values(data).map((seriesData) => ({
      ...seriesData,
      [filters?.count_variable_name?.value]:(aggregation === "Sum"
      ? seriesData.value
      : seriesData.value / seriesData.numVal).toFixed(2),
    }));
    return {
      data: transformedData,
    };

    //left axis is `series`
    //bottom axis is `variable`
  }
  if(chartType === "line"){
    const data = Object.values(tableData).reduce((a, tData) => {
      const curSeriesValue = tData[series];
      const curHourValue = tData['hour']
      if(!a[curSeriesValue]){
        a[curSeriesValue] = {
          id: curSeriesValue,
          name: curSeriesValue,
          data: {}
        };
      }
  
      if (!a[curSeriesValue].data[curHourValue]) {
        //If we haven't seen this hour yet, initialzie
        a[curSeriesValue].data[curHourValue] = {
          x: curHourValue,
          y: 0,
          numVal: 0,
        };
      }
  
      a[curSeriesValue].data[curHourValue]["y"] += tData["count"];
      a[curSeriesValue].data[curHourValue]["numVal"]++;
  
      return a;
    }, {})
    const transformedData = Object.values(data).map((seriesData) => ({
      ...seriesData,
      data: Object.values(seriesData.data).map((datum) => {
        const yVal = aggregation === "Sum" ? datum.y : datum.y / datum.numVal;
        return { x: datum.x, y: yVal };
      }),
    }));
    return {
      data: transformedData,
    };

  }
  else{
    return {
      data: {},
    }
  }


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
};
