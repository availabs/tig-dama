import React, { useMemo } from "react";
import { get } from "lodash";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";

import { Button } from "~/modules/avl-components/src";
import { CHART_TYPES, AGGREGATION_TYPES, SERIES_TYPES } from "./chartConstants";
import { FilterControlContainer } from "../../controls/FilterControlContainer";

export const HubboundChartFilters = ({
  filters,
  setFilters,
  node,
  userHighestAuth
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
    <div className="flex w-full">
      <div className="flex flex-wrap">
        <FilterControlContainer 
          header={'Chart Type:'}
          input={({className}) => (
            <select
              className={className}
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
            )}
        />
        <FilterControlContainer 
          header={'Aggregation:'}
          input={({className}) => (
            <select
              className={className}
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
          )}
        />
        <FilterControlContainer 
          header={'Series:'}
          input={({className}) => (
            <select
              className={className}
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
          )}
        />
      </div>
      {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="ml-auto mt-5 mr-1">
        <Button
          themeOptions={{ size: "sm", color: "primary" }}
          onClick={downloadImage}
          
        >
          Download
        </Button>
      </div>}
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
