import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "lodash";

import { createHubboundFilterClause } from "../utils";
import { HUBBOUND_ATTRIBUTES } from "../constants";
import { BAR_CHART_PROPS, LINE_GRAPH_PROPS } from "./chartConstants";
import { DamaContext } from "~/pages/DataManager/store";
import { ResponsiveBar } from "@nivo/bar";
import { LineGraph } from "~/modules/avl-graph/src";

const ChartPage = (props) => {
  const {
    activeViewId,
    views,
    transform = () => null,
    filterData = {},
    ChartFilter = <div />,
    HubboundFilter = <div />
  } = props;

  const [searchParams] = useSearchParams();
  const { falcor, falcorCache, pgEnv } = useContext(DamaContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [filters, _setFilters] = useState(filterData);
  const [chartFilters, _setChartFilters] = useState({})
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);
  const setChartFilters = useCallback((chartFilters) => {
    _setChartFilters((prev) => ({ ...prev, ...chartFilters }));
  }, []);

  const activeDataVersionId = parseInt(searchParams.get("variable")) || activeViewId || views?.[0].view_id;
  const count_variable_name = useMemo(() => get(filters, "count_variable_name.value"), [filters]);
  const year = useMemo(() => get(filters, "year.value"), [filters]);

  //initialize data filters
  useEffect(() => {
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: 2019 };
    }
    if (!count_variable_name) {
      newFilters.count_variable_name = {
        value: HUBBOUND_ATTRIBUTES["count_variable_name"].values[0],
      };
    }
    setFilters(newFilters);
  }, []);

  //Must always have a `count_variable_name`
  useEffect(() => {
    const newFilters = { ...filters };
    if (count_variable_name === "all") {
      newFilters.count_variable_name = {
        value: HUBBOUND_ATTRIBUTES["count_variable_name"].values[0],
      };
    }
    setFilters(newFilters);
  }, [count_variable_name]);

  const chartType = useMemo(() => get(chartFilters, "chartType.value"), [chartFilters]);
  const aggregation = useMemo(() => get(chartFilters, "aggregation.value"), [chartFilters]);
  const series = useMemo(() => get(chartFilters, "series.value"), [chartFilters]);

  //Initialize chart filters
  useEffect(() => {
    const newFilters = { ...chartFilters };
    if (!chartType) {
      newFilters.chartType = { value: "line" };
    }
    if (!aggregation) {
      newFilters.aggregation = { value: "Sum" };
    }
    if (!series) {
      newFilters.series = { value: "direction" };
    }
    setChartFilters(newFilters);
  }, []);

  const hubboundDetailsOptions = useMemo(() => {
    return createHubboundFilterClause(filters);
  }, [filters]);

  const hubboundDetailsPath = useMemo(() => {
    return [
      "dama",
      pgEnv,
      "viewsbyId",
      activeDataVersionId,
      "options",
      hubboundDetailsOptions,
    ];
  }, [pgEnv, activeDataVersionId, hubboundDetailsOptions]);

  useEffect(() => {
    async function fetchData() {
      console.log("getting view data inside CHART page",hubboundDetailsPath)

      const lenRes = await falcor.get([...hubboundDetailsPath, 'length']);
      const len = get(lenRes, ['json', ...hubboundDetailsPath, 'length'], 0);
  
      await falcor.get([...hubboundDetailsPath, 'databyIndex', {
          from: 0,
          to: len - 1
      }, Object.keys(HUBBOUND_ATTRIBUTES)]);
      setIsLoading(false);
    }

    if (year && count_variable_name) {
      setIsLoading(true);
      fetchData();
    }
  }, [pgEnv, activeDataVersionId, hubboundDetailsOptions])

  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});
    return tableDataById;
  }, [activeDataVersionId, falcorCache, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  let { data } = useMemo(
    () =>
      transform({
        tableData, //RYAN TODO this is basically lightly formatted data
        filters,
        chartFilters,
      }),
    [tableData, transform, filters, chartFilters]
  );

  const countAxisName = `${aggregation} ${count_variable_name}`;
  const chartComponent = useMemo(() => {
    if (data && data.length === 0 && !isLoading) {
      console.log("No data detected", data);
      return (
        <div className="ml-12 text-xl justify-self-center">
          No data for selected filters
        </div>
      );
    } else {
      return generateChart(data, chartType, countAxisName, count_variable_name);
    }
  }, [data, chartType, countAxisName, isLoading]);

  const [ref, setRef] = useState(null);
  return (
    <div>
      <div className="flex justify-start content-center flex-wrap">
        <div className="flex w-full">
          <ChartFilter
            filters={chartFilters}
            setFilters={setChartFilters}
            node={ref}
          />
        </div>
        <div className="flex mt-4">
          <HubboundFilter filters={filters} setFilters={setFilters} filterType={"chartFilter"}/>
        </div>
      </div>
      <div style={{ height: "600px" }} className="grid" ref={setRef}>
        {chartComponent}
      </div>
    </div>
  );
};

const generateChart = (data, chartType, countAxisName, count_variable_name) => {
  switch (chartType) {
    case "bar":
      const barAxisBottomConfig = {...BAR_CHART_PROPS?.axisBottom, legend: countAxisName}
      const barChartProps ={ ...BAR_CHART_PROPS, axisBottom: barAxisBottomConfig, keys:[count_variable_name]}
      return <ResponsiveBar {...barChartProps} data={data} />;
    case "line":
      const lineAxisLeftConfig = {...LINE_GRAPH_PROPS?.axisLeft, label: countAxisName};
      const lineChartProps ={ ...LINE_GRAPH_PROPS, axisLeft: lineAxisLeftConfig}
      return <LineGraph {...lineChartProps} data={data} />;
    default:
      console.error("no chart type detected::", chartType);
      return <>No Chart Type</>
    }
};

export default ChartPage;
