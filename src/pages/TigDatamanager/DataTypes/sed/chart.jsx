import React, { useState, useMemo } from "react";

import { useParams } from "react-router-dom";
import get from "lodash/get";

import { DamaContext } from "~/pages/DataManager/store";

// import { useFalcor } from "~/modules/avl-components/src";
import { LineGraph } from "~/modules/avl-graph/src";
import { ResponsivePieCanvas } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

const COLOR_ARRAY = [
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
];

const DefaultTableFilter = () => <div />;

const identityMap = (tableData, attributes) => {
  return {
    data: tableData,
    columns: attributes.map((d) => ({
      Header: d,
      accessor: d,
    })),
  };
};

const PieChart = ({ pieData, year }) => {
  return (
    <>
      <ResponsivePieCanvas
        data={
          (pieData || []).map((p) => {
            return {
              id: p?.id || "",
              label: p?.name || "",
              value: ((p?.data || []).find(
                (f) => Number(f.x) === Number(year)
              ) || {})["y"],
            };
          }) || []
        }
        margin={{ top: 40, right: 200, bottom: 40, left: 80 }}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "paired" }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.6]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#333333"
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        // fill={}
        legends={[
          {
            anchor: "right",
            direction: "column",
            justify: false,
            translateX: 140,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 60,
            itemHeight: 14,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 14,
            symbolShape: "circle",
          },
        ]}
      />
    </>
  );
};

const LineChart = ({ lineData }) => {
  return (
    <LineGraph
      colors={COLOR_ARRAY}
      data={lineData}
      axisBottom={{ tickDensity: 1 }}
      axisLeft={{
        lzabel: "Values",
        showGridLines: true,
        tickDensity: 1,
      }}
      axisRight={{
        label: "Year",
        showGridLines: false,
      }}
      hoverComp={{
        idFormat: (id, data) => data.name,
        yFormat: ",.2f",
        showTotals: false,
      }}
      margin={{
        top: 20,
        bottom: 25,
        left: 80,
        right: 30,
      }}
    />
  );
};

const BarChart = ({ barData, year }) => {
  return (
    <>
      <ResponsiveBar
        data={
          (barData || []).map((b) => {
            return {
              id: b?.id || "",
              label: b?.name || "",
              value: ((b?.data || []).find(
                (f) => Number(f.x) === Number(year)
              ) || {})["y"],
            };
          }) || []
        }
        keys={["value"]}
        indexBy="id"
        margin={{ top: 20, right: 60, bottom: 50, left: 100 }}
        pixelRatio={2}
        padding={0.15}
        innerPadding={0}
        minValue="auto"
        maxValue="auto"
        groupMode="stacked"
        layout="horizontal"
        reverse={false}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "category10" }}
        borderColor={{
          from: "color",
          modifiers: [
            ["darker", 0.6],
            ["opacity", 0.5],
          ],
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        enableGridX={true}
        enableGridY={false}
        enableLabel={true}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        isInteractive={true}
        legends={[]}
      />
    </>
  );
};
const AreaChart = ({ areaData }) => {
  let minYValue;

  areaData.forEach(area => {
    area.data.forEach(point => {
      if(minYValue === undefined || point.y < minYValue ){
        minYValue = point.y;
      }
    })
  })

  return <ResponsiveLine
    data={areaData}
    colors={COLOR_ARRAY}
    margin={{ top: 50, right: 200, bottom: 50, left: 75 }}
    xScale={{ type: "point" }}
    yScale={{
      type: "linear",
      min: 0,
      max: "auto",
      reverse: false,
    }}
    yFormat=" >-.2f"
    curve="linear"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "year",
      legendOffset: 36,
      legendPosition: "middle",
      truncateTickAt: 0,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "count",
      legendOffset: -50,
      legendPosition: "middle",
      truncateTickAt: 0,
      format: v => v.toLocaleString()
    }}
    enableGridX={false}
    enablePoints={true}
    pointSize={5}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="data.yFormatted"
    pointLabelYOffset={-12}
    enableArea={true}
    areaOpacity={0.3}
    areaBlendMode={"normal"}
    isInteractive={true}
    enableSlices={'x'}
    enableTouchCrosshair={false}
    sliceTooltip={(data) => {
      return (
        <div key={data?.slice?.id} className="bg-white rounded p-2 opacity-85">
          <b>{data.slice.points[0].data.x}</b>
          {
            data.slice.points.map(point => {
              const isMaxVal = data.slice.points.every(iPoint => iPoint.data.y  <= point.data.y);
              return (
                <div className={`flex items-center rounded px-1 border-2  ${isMaxVal ? 'border-2 border-black' : 'border-white/85'}`}>
                  <div
                    style={{background:point.serieColor}}
                    className={`w-[15px] h-[15px] mr-2`}
                  />
                  <div>{point.serieId} {point.data.yFormatted}</div>
                </div>
              )
            })
          }
        </div>
      )
    }}
    legends={[
      {
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: 150,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: "left-to-right",
        itemWidth: 120,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: "circle",
        symbolBorderColor: "rgba(0, 0, 0, .5)",
        effects: [
          {
            on: "hover",
            style: {
              itemBackground: "rgba(0, 0, 0, .03)",
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
  />;
};

const TablePage = ({
  source,
  views,
  transform = identityMap,
  filterData = {},
  TableFilter = DefaultTableFilter,
}) => {
  const { viewId } = useParams();
  const [filters, _setFilters] = useState(filterData);
  const setFilters = React.useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);
  const { pgEnv, falcor, falcorCache, user } = React.useContext(DamaContext);

  const activeView = React.useMemo(() => {
    return get(
      views.filter((d) => d.view_id === viewId),
      "[0]",
      views[0]
    );
  }, [views, viewId]);

  const activeViewId = React.useMemo(
    () => get(activeView, `view_id`, null),
    [activeView]
  );

  React.useEffect(() => {
    falcor
      .get(["dama", pgEnv, "viewsbyId", activeViewId, "data", "length"])
      .then((d) => {
        console.timeEnd("getviewLength");
      });
  }, [pgEnv, activeViewId]);

  const dataLength = React.useMemo(() => {
    return get(
      falcorCache,
      ["dama", pgEnv, "viewsbyId", activeViewId, "data", "length"],
      "No Length"
    );
  }, [pgEnv, activeViewId, falcorCache]);

  const attributes = React.useMemo(() => {
    return (source?.metadata?.columns || source?.metadata || [])
      .filter((d) => ["integer", "string", "number"].includes(d.type))
      .map((d) => d.name);
  }, [source]);

  React.useEffect(() => {
    if (dataLength > 0) {
      let maxData = Math.min(dataLength, 10000);
      falcor.chunk([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "databyIndex",
        [...Array(maxData).keys()],
        attributes,
      ]);
    }
  }, [pgEnv, activeViewId, dataLength, attributes]);

  const tableData = React.useMemo(() => {
    let data = Object.values(
      get(
        falcorCache,
        ["dama", pgEnv, "viewsbyId", activeViewId, "databyIndex"],
        []
      )
    ).map((d) => get(falcorCache, d.value, {}));

    return data;
  }, [pgEnv, activeViewId, falcorCache, dataLength]);

  let years = get(activeView, ["metadata", "years"], []);

  const { data } = React.useMemo(
    () => transform(tableData, attributes, filters, years, "group_by_county"),
    [tableData, attributes, transform, filters]
  );

  const [ref, setRef] = React.useState(null);
  const [chartType, year] = useMemo(
    () => [
      get(filters, "chartType.value", "line"),
      get(filters, "year.value", "0"),
    ],
    [filters]
  );

  return (
    <div>
      <div className="flex">
        <TableFilter
          years={years}
          filters={filters}
          setFilters={setFilters}
          node={ref}
        />
      </div>
      <div style={{ height: "800px", overflow:"hidden" }} ref={setRef}>
        {data?.length ? (
          <>
            {chartType === "line" ? <LineChart lineData={data} /> : null}
            {chartType === "area" ? <AreaChart areaData={data} /> : null}
            {chartType === "bar" ? (
              <BarChart
                barData={data}
                year={years[Number(year)]}
                activeVar={filters?.activeVar.value || ""}
              />
            ) : null}
            {chartType === "pie" ? (
              <PieChart pieData={data} year={years[Number(year)]} />
            ) : null}
          </>
        ) : (
          <div
            className="text-center justify-content-center"
            style={{ height: "600px", lineHeight: "600px" }}
          >
            No Chart Data Available
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePage;
