import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "lodash";

import { createHubboundFilterClause } from "../utils";
import { HUBBOUND_ATTRIBUTES } from "../constants";
import { BAR_CHART_PROPS, LINE_GRAPH_PROPS } from "./chartConstants";
import { DamaContext } from "~/pages/DataManager/store";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

const ChartPage = (props) => {
  const {
    activeViewId,
    views,
    transform = () => null,
    filterData = {},
    ChartFilter = <div />,
    HubboundFilter = <div />,
    userHighestAuth
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
  const sectorName = useMemo(() => get(chartFilters, "sector_name.value"), [filters]);
  const direction = useMemo(() => get(chartFilters, "direction.value"), [filters]);

  //initialize data filters

  const yearRange = useMemo(() => {
    return get(
      falcorCache,
      [
        "dama",
        pgEnv,
        "views",
        "byId",
        activeDataVersionId,
        "attributes",
        "metadata",
        "value",
        "years",
      ],
      []
    );
  }, [pgEnv, falcorCache, activeDataVersionId]);

  useEffect(() => {
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: yearRange[0] };
    }
    if (!count_variable_name) {
      newFilters.count_variable_name = {
        value: HUBBOUND_ATTRIBUTES["count_variable_name"].values[0],
      };
    }
    if(!sectorName) {
      newFilters.sector_name = { value: HUBBOUND_ATTRIBUTES['sector_name'].values[0] };
    }
    if(!direction) {
      newFilters.direction = { value: HUBBOUND_ATTRIBUTES['direction'].values[0] };
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
      return generateChart(data, chartType, countAxisName, count_variable_name, {...filters, ...chartFilters});
    }
  }, [data, chartType, countAxisName, isLoading, filters, chartFilters]);

  const [ref, setRef] = useState(null);
  return (
    <div>
      <div className="flex justify-start content-center flex-wrap">
        <div className="flex w-full">
          <ChartFilter
            activeViewId={activeDataVersionId}
            userHighestAuth={userHighestAuth}
            filters={chartFilters}
            setFilters={setChartFilters}
            node={ref}
          />
        </div>
        <div className="flex">
          <HubboundFilter activeViewId={activeDataVersionId} filters={filters} setFilters={setFilters} filterType={"chartFilter"}/>
        </div>
      </div>
      <div style={{ height: "600px" }} className="grid" ref={setRef}>
        {chartComponent}
      </div>
    </div>
  );
};

const Title = (props) => {
  let { width, height, filters, sourceType } = props;
  if (props.bars) {
    filters = props.bars[0].data.data.filters;
    sourceType = props.bars[0].data.data.sourceType;
  }

  const style = { fontWeight: "bold", textTransform: "capitalize" };

  const aggregation = filters?.aggregation?.value || "";
  const series = filters?.series?.value || "";
  const count_variable_name = filters?.count_variable_name?.value || "";
  const year = filters?.year?.value || "";
  const direction = filters?.direction?.value || "";
  const transit_mode_name = filters?.transit_mode_name?.value || "";
  const sector_name = filters?.sector_name?.value || "";
  
  return (
    <>
      <text x={5} y={-55} style={style}>
        {aggregation} {aggregation === "Sum" ? "of" : "number of"} {count_variable_name} by {series}
      </text>
      <text x={5} y={-35} style={style}>
        {transit_mode_name === "all" ? 'All Modes' : transit_mode_name} {direction === "all" ? 'Both Directions' : direction}
      </text>
      <text x={5} y={-15} style={style}>
        {sector_name === "all" ? 'All Sectors' : sector_name} | {year}
      </text>
    </>
  );
}

const generateChart = (
  data,
  chartType,
  countAxisName,
  count_variable_name,
  filters
) => {
  switch (chartType) {
    case "bar":
      const barAxisBottomConfig = {
        ...BAR_CHART_PROPS?.axisBottom,
        legend: countAxisName,
      };
      const barChartProps = {
        ...BAR_CHART_PROPS,
        axisBottom: barAxisBottomConfig,
        keys: [count_variable_name],
        layers: [
          "grid",
          "axes",
          "bars",
          "totals",
          "markers",
          "legends",
          "annotations",
          Title,
        ],
      };
      return (
        <ResponsiveBar
          {...barChartProps}
          data={data.map((d) => ({ ...d, filters: filters }))}
        />
      );
    case "line":
      const lineAxisLeftConfig = {
        ...LINE_GRAPH_PROPS?.axisLeft,
        label: countAxisName,
      };
      const lineChartProps = {
        ...LINE_GRAPH_PROPS,
        axisLeft: lineAxisLeftConfig,
        layers: [
          "grid",
          "markers",
          "axes",
          "areas",
          "crosshair",
          "lines",
          "points",
          "slices",
          "mesh",
          "legends",
          Title,
        ],
      };
      return <ResponsiveLine {...lineChartProps} data={data} filters={filters} />;
    default:
      console.error("no chart type detected::", chartType);
      return <>No Chart Type</>;
  }
};

export default ChartPage;
