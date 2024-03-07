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
      console.log("getting view data")
  
      const lenRes = await falcor.get([...hubboundDetailsPath, 'length']);
      const len = get(lenRes, ['json', ...hubboundDetailsPath, 'length'], 0);
  
      await falcor.get([...hubboundDetailsPath, 'databyIndex', {
          from: 0,
          to: len - 1
      }, Object.keys(HUBBOUND_ATTRIBUTES)]);
    }

    fetchData();
  }, [pgEnv, viewId, hubboundDetailsOptions])

  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});

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

  const [chartType] = useMemo(
    () => [
      get(chartFilters, "chartType.value", "bar"),
      // get(filters, "area.value", "all"),
      // get(filters, "summarize.value", "county"),
    ],
    [chartFilters]
  );

  const chartComponent = generateChart(data, chartType)

  console.log(data)
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

const generateChart = (data, chartType) => {
  switch (chartType) {
    case "bar":
      console.log("BAR chart detected");
      return <ResponsiveBar {...BAR_CHART_PROPS} data={data} />;
    case "line":
      console.log("LINE chart detected");
      return <LineGraph {...LINE_GRAPH_PROPS} data={data} />;
    default:
      console.error("no chart type detected::", chartType);
      return <>No Chart Type</>
    }
};

export default ChartPage;
