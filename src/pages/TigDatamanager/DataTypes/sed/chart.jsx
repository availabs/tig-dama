import React, { useState, useMemo } from "react";

import { useParams } from "react-router-dom";
import get from "lodash/get";

import { DamaContext } from "~/pages/DataManager/store";

// import { useFalcor } from "~/modules/avl-components/src";
import { LineGraph } from "~/modules/avl-graph/src";
import { ResponsivePieCanvas } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";

const ViewSelector = ({ views }) => {
  const { viewId } = useParams();

  return (
    <div className="flex flex-1">
      <div className="py-3.5 px-2 text-sm text-gray-400">Version : </div>
      <div className="flex-1">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={viewId}
        >
          {views
            .sort((a, b) => b.view_id - a.view_id)
            .map((v, i) => (
              <option key={i} className="ml-2  truncate" value={v.view_id}>
                {v.version ? v.version : v.view_id}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

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
      colors={[
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
      ]}
      data={lineData}
      axisBottom={{ tickDensity: 1 }}
      axisLeft={{
        lzabel: "Values",
        showGridLines: false,
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
  console.log("areaData", areaData);
  <ResponsiveLine
    data={[
      {
        id: "japan",
        color: "hsl(13, 70%, 50%)",
        data: [
          {
            x: "plane",
            y: 155,
          },
          {
            x: "helicopter",
            y: 221,
          },
          {
            x: "boat",
            y: 2,
          },
          {
            x: "train",
            y: 248,
          },
          {
            x: "subway",
            y: 83,
          },
          {
            x: "bus",
            y: 246,
          },
          {
            x: "car",
            y: 134,
          },
          {
            x: "moto",
            y: 250,
          },
          {
            x: "bicycle",
            y: 224,
          },
          {
            x: "horse",
            y: 81,
          },
          {
            x: "skateboard",
            y: 252,
          },
          {
            x: "others",
            y: 174,
          },
        ],
      },
      {
        id: "france",
        color: "hsl(33, 70%, 50%)",
        data: [
          {
            x: "plane",
            y: 209,
          },
          {
            x: "helicopter",
            y: 134,
          },
          {
            x: "boat",
            y: 231,
          },
          {
            x: "train",
            y: 90,
          },
          {
            x: "subway",
            y: 93,
          },
          {
            x: "bus",
            y: 49,
          },
          {
            x: "car",
            y: 129,
          },
          {
            x: "moto",
            y: 268,
          },
          {
            x: "bicycle",
            y: 102,
          },
          {
            x: "horse",
            y: 273,
          },
          {
            x: "skateboard",
            y: 39,
          },
          {
            x: "others",
            y: 4,
          },
        ],
      },
      {
        id: "us",
        color: "hsl(130, 70%, 50%)",
        data: [
          {
            x: "plane",
            y: 223,
          },
          {
            x: "helicopter",
            y: 220,
          },
          {
            x: "boat",
            y: 242,
          },
          {
            x: "train",
            y: 12,
          },
          {
            x: "subway",
            y: 101,
          },
          {
            x: "bus",
            y: 102,
          },
          {
            x: "car",
            y: 119,
          },
          {
            x: "moto",
            y: 71,
          },
          {
            x: "bicycle",
            y: 191,
          },
          {
            x: "horse",
            y: 240,
          },
          {
            x: "skateboard",
            y: 147,
          },
          {
            x: "others",
            y: 278,
          },
        ],
      },
      {
        id: "germany",
        color: "hsl(173, 70%, 50%)",
        data: [
          {
            x: "plane",
            y: 206,
          },
          {
            x: "helicopter",
            y: 277,
          },
          {
            x: "boat",
            y: 284,
          },
          {
            x: "train",
            y: 226,
          },
          {
            x: "subway",
            y: 46,
          },
          {
            x: "bus",
            y: 10,
          },
          {
            x: "car",
            y: 137,
          },
          {
            x: "moto",
            y: 298,
          },
          {
            x: "bicycle",
            y: 16,
          },
          {
            x: "horse",
            y: 65,
          },
          {
            x: "skateboard",
            y: 46,
          },
          {
            x: "others",
            y: 166,
          },
        ],
      },
      {
        id: "norway",
        color: "hsl(61, 70%, 50%)",
        data: [
          {
            x: "plane",
            y: 186,
          },
          {
            x: "helicopter",
            y: 19,
          },
          {
            x: "boat",
            y: 163,
          },
          {
            x: "train",
            y: 231,
          },
          {
            x: "subway",
            y: 89,
          },
          {
            x: "bus",
            y: 181,
          },
          {
            x: "car",
            y: 77,
          },
          {
            x: "moto",
            y: 19,
          },
          {
            x: "bicycle",
            y: 9,
          },
          {
            x: "horse",
            y: 21,
          },
          {
            x: "skateboard",
            y: 224,
          },
          {
            x: "others",
            y: 262,
          },
        ],
      },
    ]}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: "point" }}
    yScale={{
      type: "linear",
      min: "auto",
      max: "auto",
      stacked: true,
      reverse: false,
    }}
    yFormat=" >-.2f"
    curve="cardinal"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "transportation",
      legendOffset: 36,
      legendPosition: "middle",
      truncateTickAt: 0,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "count",
      legendOffset: -40,
      legendPosition: "middle",
      truncateTickAt: 0,
    }}
    enableGridX={false}
    enablePoints={false}
    pointSize={10}
    pointColor={{ theme: "background" }}
    pointBorderWidth={2}
    pointBorderColor={{ from: "serieColor" }}
    pointLabel="data.yFormatted"
    pointLabelYOffset={-12}
    enableArea={true}
    areaOpacity={0.15}
    isInteractive={false}
    enableTouchCrosshair={true}
    legends={[
      {
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: "left-to-right",
        itemWidth: 80,
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
        {/*<ViewSelector views={views} />*/}
      </div>
      <div style={{ height: "600px" }} ref={setRef}>
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
