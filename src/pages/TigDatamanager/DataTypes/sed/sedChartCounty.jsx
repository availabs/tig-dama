import React, { useMemo } from "react";
import get from "lodash/get";
import sumBy from "lodash/sumBy";
import { regionalData } from "../constants/index";
import { Button } from "~/modules/avl-components/src";
import { toPng } from "html-to-image";
import download from "downloadjs";

import { useSearchParams } from "react-router-dom";

import { sedVarsCounty as sedVars } from "./sedCustom";
import { FilterControlContainer } from "../controls/FilterControlContainer";

const defaultRange = [
  "#ffffb2",
  "#fed976",
  "#feb24c",
  "#fd8d3c",
  "#fc4e2a",
  "#e31a1c",
  "#b10026",
];
const defaultDomain = [0, 872, 2047, 3649, 6934, 14119, 28578];

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
  county: {name: "County" }
};

const areas = [
  ...Object.keys(regionalData?.regions || {}),
  ...Object.keys(regionalData?.sub_regions || {}),
];

const SedChartFilterCounty = ({ years, filters, setFilters, node }) => {
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let area = useMemo(() => get(filters, "area.value", ""), [filters]);
  let summarize = useMemo(() => get(filters, "summarize.value", ""), [filters]);
  let aggFunc = useMemo(() => get(filters, "aggregate.value", ""), [filters]);
  let year = useMemo(() => get(filters, "year.value", "0"), [filters]);
  let chartType = useMemo(
    () => get(filters, "chartType.value", "line"),
    [filters]
  );

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  React.useEffect(() => {
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${searchVar}` },
        });
      } else {
        setFilters({
          activeVar: { value: "tot_pop" },
        });
      }
    }
  }, [activeVar, setFilters, searchVar]);

  /**
   * Sets default filters
   */
  React.useEffect(() => {
    const update = {};
    if (!get(filters, "area.value", null)) {
      update.area = { value: "all" };
    }
    if (!get(filters, "summarize.value", null)) {
      update.summarize = { value: "region" };
    }
    if (!get(filters, "aggregate.value", null)) {
      const defaultAggFunc = sedVars[activeVar]?.aggFunc === "avg" ? "avg" : "sum";
      update.aggregate = { value: defaultAggFunc };
    }
    if (!get(filters, "chartType.value", null)) {
      update.chartType = { value: "line" };
    }
    if (!get(filters, "year.value", null)) {
      update.year = { value: 0 };
    }
    setFilters(update);
  }, []);

  const downloadImage = React.useCallback(() => {
    if (!node) return;
    const name = get(sedVars, [activeVar, "name"], null);
    if (!name) return;
    toPng(node, { backgroundColor: "#fff" }).then((dataUrl) => {
      download(dataUrl, `${name}.png`, "image/png");
    });
  }, [node, activeVar]);

  return (
    <div className="flex w-full p-1">
      <div className="flex flex-wrap">
        <FilterControlContainer 
          header={"Area: "}
          input={({className}) => (<select
            className={className}
            value={area}
            onChange={(e) =>
              setFilters({
                ...filters,
                area: { value: e.target.value },
                summarize: {
                  value: e.target.value === "all" ? summarize : "county",
                },
              })
            }
          >
            <option className="ml-2  truncate" value={"all"}>
              All
            </option>
            {(areas || []).map((area, i) => (
              <option key={i} className="ml-2  truncate" value={area}>
                {area}
              </option>
            ))}
          </select>)}
        />
        <FilterControlContainer 
          header={"Summarize: "}
          input={({className}) => (<select
            className={className}
            value={summarize}
            onChange={(e) =>
              setFilters({ ...filters, summarize: { value: e.target.value } })
            }
          >
            {area === "all" ? (
              <>
                {Object.keys(summarizeVars).map((k, i) => (
                  <option key={i} className="ml-2  truncate" value={k}>
                    {summarizeVars[k]?.name}
                  </option>
                ))}
              </>
            ) : null}
          </select>)}
        />
        {summarize !== "county" && <FilterControlContainer 
          header={"Aggregation: "}
          input={({className}) => (<select
            className={className}
            value={aggFunc}
            onChange={(e) =>
              setFilters({ ...filters, aggregate: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={"sum"}>
              Sum
            </option>
            <option className="ml-2  truncate" value={"avg"}>
              Average
            </option>
          </select>)}
        />}
        <FilterControlContainer 
          header={"Chart Type: "}
          input={({className}) => (  <select
            className={className}
            value={chartType}
            onChange={(e) =>
              setFilters({ ...filters, chartType: { value: e.target.value } })
            }
          >
            <option className="ml-2 truncate" value="line">
              Line
            </option>
            <option className="ml-2 truncate" value="area">
              Area
            </option>
            <option className="ml-2 truncate" value="bar">
              Bar
            </option>
            <option className="ml-2 truncate" value="pie">
              Pie
            </option>
          </select>)}
        />
        <FilterControlContainer 
          header={"Variable: "}
          input={({className}) => (<select
            className={className}
            value={activeVar}
            onChange={(e) =>
              setFilters({ ...filters, activeVar: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              none
            </option>
            {Object.keys(sedVars).map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {sedVars[k].name}
              </option>
            ))}
          </select>)}
        />
        {chartType === "pie" || chartType === "bar" ? (
          <FilterControlContainer 
            header={"Year: "}
            input={({className}) => (
              <div className={className}>
                <div className="px-6">
                  <input
                    type="range"
                    min="0"
                    max={years.length - 1}
                    id="my-range"
                    list="my-datalist"
                    className="w-full"
                    value={year}
                    onChange={(e) =>
                      setFilters({
                        year: { value: e.target.value },
                      })
                    }
                  />
                </div>
                <datalist id="my-datalist" className="w-full flex">
                  {(years || ["2010"]).map((k, i) => (
                    <option
                      key={i}
                      value={i}
                      className={`flex-1 text-gray-500 text-center text-xs`}
                    >
                      {k}
                    </option>
                  ))}
                </datalist>
              </div>
            )}
          />) : null
          }
      </div>
      <div className="ml-auto mt-5 mr-1">
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

const getSelectedArea = (area, groupByTableData) => {
  let selectedGroupByTableData = {};
  if (regionalData?.regions?.hasOwnProperty(area)) {
    regionalData?.regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData[key];
    });
  } else if (regionalData?.sub_regions?.hasOwnProperty(area)) {
    regionalData?.sub_regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData[key];
    });
  }
  return selectedGroupByTableData;
};

const SedChartTransformCounty = (
  tableData,
  attributes,
  filters,
  years,
  flag
) => {
  let activeVar = get(filters, "activeVar.value", "tot_pop");

  const defaultAggFunc = sedVars[activeVar].aggFunc === "avg" ? "avg" : "sum";
  let aggFunc = get(filters, "aggregate.value", defaultAggFunc);
  let summarize = get(filters, "summarize.value", "county");
  let area = get(filters, "area.value", "all");

  let updatedYears = years?.map((str) => ("" + str).slice(-2));

  const columns = [];
  (updatedYears || []).forEach((y, i) => {
    (columns || []).push({
      Header: `20${y}`,
      accessor: `${activeVar}_${i}`,
      groupFunction: sedVars[activeVar].groupFunction || sumBy,
    });
  });

  /**
   * GroupBy county_nam
   */
  let groupByTableData = (tableData || []).reduce((g, d) => {
    const { county } = d;
    if (county !== null) {
      g[`${county}`] = g[`${county}`] ?? [];
      g[`${county}`].push(d);
    }
    return g;
  }, {});

  if (area !== "all") {
    groupByTableData = getSelectedArea(area, groupByTableData);
  }

  const getSum = (accessor, summarizeKeys, groupByTableData) => {
    let sum = 0,
      count = 0;
    (summarizeKeys || []).forEach((k) => {
      const selectedCounty = groupByTableData[`${k}`] || {};
      sum += Math.floor(
        sumBy(selectedCounty, (item) => parseInt(item[accessor])) || 0
      );
      count += selectedCounty.length || 0;
    });
    return { sum, count };
  };

  /**
   * Modify graph data accordingly
   */
  let finalGraphData = new Array(Object.keys(groupByTableData).length).fill({});
  if (flag === "group_by_county") {
    if (summarize !== "county") {
      const keys =
        summarize === "subRegion"
          ? regionalData?.sub_regions
          : regionalData?.regions;
      finalGraphData = new Array(Object.keys(keys).length).fill({});
      finalGraphData = Object.keys(keys).map((key) => ({
        id: key,
        name: key,
        data: (columns || []).map((col) => {
          const sum = getSum(col?.accessor, keys[`${key}`], groupByTableData);

          let yValue = sum.sum;
          if (
            aggFunc === "avg"
          ) {
            yValue = yValue / sum.count;
          }

          return {
            x: col?.Header,
            y: yValue,
          };
        }),
      }));
    } else {
      finalGraphData = Object.keys(groupByTableData).map((key) => ({
        id: key,
        name: key,
        data: (columns || []).map((col) => ({
          x: col?.Header,
          y: Math.floor(
            sumBy(groupByTableData[`${key}`], `${col.accessor}`) || 0
          ),
        })),
      }));
    }
  }
  return {
    data: finalGraphData,
    columns,
  };
};

export { SedChartFilterCounty, SedChartTransformCounty };
