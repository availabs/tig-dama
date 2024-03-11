import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { get } from "lodash";

import { createHubboundFilterClause } from "../utils";
import { HUBBOUND_ATTRIBUTES } from "../constants";
import { BAR_CHART_PROPS, LINE_GRAPH_PROPS } from "./chartConstants";
import { DamaContext } from "~/pages/DataManager/store";
import { ResponsiveBar } from "@nivo/bar";
import { LineGraph } from "~/modules/avl-graph/src";

const ChartPage = ({
  views,
  transform = () => null,
  filterData = {},
  ChartFilter = <div />,
  HubboundFilter = <div />
}) => {
  const { viewId } = useParams();
  const { falcor, falcorCache, pgEnv } = useContext(DamaContext);
  const [filters, _setFilters] = useState(filterData);
  const [chartFilters, _setChartFilters] = useState({})
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);
  const setChartFilters = useCallback((chartFilters) => {
    _setChartFilters((prev) => ({ ...prev, ...chartFilters }));
  }, []);

  const count_variable_name = useMemo(() => get(filters, "count_variable_name.value"), [filters]);
  const year = useMemo(() => get(filters, "year.value"), [filters]);

  //initialize data filters
  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value: 2019 }
    }   
    if (!count_variable_name) {
      newFilters.count_variable_name = { value: HUBBOUND_ATTRIBUTES['count_variable_name'].values[0] }
    }
    setFilters(newFilters)
  }, []);

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
      newFilters.aggregation = { value: "sum" };
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
      viewId, //ryan TODO might need to make sure URL routing is correct, otherwise need different way to get activeViewId
      "options",
      hubboundDetailsOptions,
    ];
  }, [pgEnv, viewId, hubboundDetailsOptions]);

  useEffect(() => {
    async function fetchData() {
      console.log("getting view data inside CHART INDEX")
  
      const lenRes = await falcor.get([...hubboundDetailsPath, 'length']);
      const len = get(lenRes, ['json', ...hubboundDetailsPath, 'length'], 0);
  
      await falcor.get([...hubboundDetailsPath, 'databyIndex', {
          from: 0,
          to: len - 1
      }, Object.keys(HUBBOUND_ATTRIBUTES)]);
    }

    if (year && count_variable_name) {
      fetchData();
    }
  }, [pgEnv, viewId, hubboundDetailsOptions])

  console.log(falcorCache)
  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});
    console.log({filters})
    return tableDataById;
  }, [viewId, falcorCache, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  let { data } = useMemo(
    () =>
      transform({
        tableData, //RYAN TODO this is basically lightly formatted data
        filters,
        chartFilters,
      }),
    [tableData, transform, filters, chartFilters]
  );


  console.log(data);
  const countAxisName = `${aggregation} ${count_variable_name}`;
  const chartComponent = useMemo(() => {
    return generateChart(data, chartType, countAxisName);
  }, [data, chartType, countAxisName]);
    


  const [ref, setRef] = useState(null);
  return (
    <div>
      <div className="flex justify-start content-center flex-wrap">
        <div className="flex">
          <ChartFilter
            filters={chartFilters}
            setFilters={setChartFilters}
            node={ref}
          />
        </div>
        <div className="flex">
          <HubboundFilter filters={filters} setFilters={setFilters} filterType={"chartFilter"}/>
        </div>
      </div>
      <div style={{ height: "600px" }} ref={setRef}>
        {chartComponent}
      </div>
    </div>
  );
};

const generateChart = (data, chartType, countAxisName) => {
  switch (chartType) {
    case "bar":
      console.log("BAR chart detected");
      const barAxisBottomConfig = {...BAR_CHART_PROPS?.axisBottom, legend: countAxisName}
      const barChartProps ={ ...BAR_CHART_PROPS, axisBottom: barAxisBottomConfig}
      return <ResponsiveBar {...barChartProps} data={data} />;
    case "line":
      console.log("LINE chart detected");
      const lineAxisLeftConfig = {...LINE_GRAPH_PROPS?.axisLeft, label: countAxisName};
      const lineChartProps ={ ...LINE_GRAPH_PROPS, axisLeft: lineAxisLeftConfig}
      return <LineGraph {...lineChartProps} data={data} />;
    default:
      console.error("no chart type detected::", chartType);
      return <>No Chart Type</>
    }
};

export default ChartPage;
