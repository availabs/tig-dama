import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { get } from "lodash";

import { DamaContext } from "~/pages/DataManager/store";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePieCanvas } from "@nivo/pie";
import { fips2Name } from "./../../constants/index";

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

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
  county: {name: "County" }
};

const Title = (props) => {
  let { width, height, filters, sourceType } = props;
  if (props.bars) {
    filters = props.bars[0].data.data.filters;
    sourceType = props.bars[0].data.data.sourceType;
  }

  const style = { fontWeight: "bold", textTransform: "capitalize" };

  const activeVar = filters?.activeVar?.value || "";
  const summarize = filters?.summarize?.value || "";
  const area = filters?.area?.value || "";

  return (
    <>
      <text x={5} y={-35} style={style}>
        {activeVar} by Year {`by ${summarizeVars[summarize].name}`}
      </text>
      <text x={5} y={-15} style={style}>
        {area === "all" ? "All Areas" : area}
      </text>
    </>
  );
};

const BarChart = ({ barData, activeVar, filters }) => {
  return (
    <>
      <ResponsiveBar
        layers={['grid', 'axes', 'bars', 'totals', 'markers', 'legends', 'annotations', Title]}
        data={barData.map(d => ({...d, filters: filters}))}
        keys={["value"]}
        indexBy="id"
        margin={{ top: 100, right: 60, bottom: 50, left: 150 }}
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
          legend: activeVar,
          legendPosition: "middle",
          legendOffset: 36,
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
const PieChart = ({ pieData }) => {
  const totalVal = pieData.reduce((acc, curr) => {
    return acc + curr.value
  }, 0)

  return (
    <>
      <ResponsivePieCanvas
        data={
          (pieData || []).map((p) => {
            return {
              id: p?.id || "",
              label: p?.name || "",
              value: p?.value / totalVal,
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
        valueFormat={(d) => `${(d*100).toFixed(2)} %`}
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

const ChartPage = ({
  views,
  transform = () => null,
  filterData = {},
  ChartFilter = <div />,
}) => {
  const { viewId } = useParams();
  const { falcor, falcorCache } = React.useContext(DamaContext);
  const [filters, _setFilters] = useState(filterData);
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);

  const activeView = useMemo(() => {
    return get(
      views.filter((d) => d.view_id === viewId),
      "[0]",
      views[0]
    );
  }, [views, viewId]);

  const [variables, years] = useMemo(() => {
    return [
      get(activeView, "metadata.variables", []),
      get(activeView, "metadata.years", []),
    ];
  }, [activeView]);

  const geoids = useMemo(
    () => get(activeView, "metadata.counties", []),
    [activeView]
  );

  const [activeCensusKeys, activeDivisorKeys] = useMemo(
    () => [
      (variables.find((v) => v.label === filters?.activeVar?.value || "") || {})
        ?.value?.censusKeys || [],
      (
        (
          variables.find((v) => v.label === filters?.activeVar?.value || "") ||
          {}
        )?.value?.divisorKeys || []
      ).filter(Boolean),
    ],
    [(variables, filters)]
  );

  const [activeYear, area, summarize] = useMemo(
    () => [
      get(filters, "year.value", "2019"),
      get(filters, "area.value", "all"),
      get(filters, "summarize.value", "county"),
    ],
    [filters]
  );

  useEffect(() => {
    async function getACSData() {
      if (geoids.length > 0)
        falcor.chunk([
          "acs",
          geoids,
          activeYear,
          [...activeCensusKeys, ...activeDivisorKeys],
        ]);
    }
    getACSData();
  }, [geoids, activeCensusKeys, activeYear]);

  const valueMap = useMemo(() => {
    const geos = Object.keys(fips2Name) || geoids || [];
    return (geos || []).reduce((a, c) => {
      let censusVal = 0,
        divisorVal = 0,
        censusFlag = false,
        divisorFalg = false;
      (activeCensusKeys || []).forEach((cc) => {
        const tmpVal = get(falcorCache, ["acs", c, activeYear, cc], null);
        if (tmpVal !== null) {
          censusFlag = true;
          censusVal += tmpVal;
        }
      });

      let tempFlag = Boolean(activeDivisorKeys.length);

      if (tempFlag) {
        if (activeDivisorKeys.length > 0) {
          (activeDivisorKeys || []).forEach((cc) => {
            const tmpVal = get(falcorCache, ["acs", c, activeYear, cc], null);
            if (tmpVal !== null) {
              divisorFalg = true;
              divisorVal += tmpVal;
            }
          });
        }
      }

      if (tempFlag) {
        a[c] = divisorFalg
          ? `${Math.round((censusVal / divisorVal) * 100)}`
          : null;
      } else {
        a[c] = censusFlag ? censusVal : null;
      }
      return a;
    }, {});
  }, [falcorCache, geoids, activeCensusKeys, activeDivisorKeys, activeYear]);

  const [chartType, year] = useMemo(
    () => [
      get(filters, "chartType.value", "line"),
      get(filters, "year.value", "0"),
    ],
    [filters]
  );

  let { data } = useMemo(
    () =>
      transform({
        valueMap,
        filters,
        isDivisor: Boolean(activeDivisorKeys.length),
      }),
    [valueMap, transform, filters]
  );

  const [ref, setRef] = React.useState(null);

  return (
    <div>
      <div className="flex">
        <ChartFilter
          filters={filters}
          setFilters={setFilters}
          variables={variables}
          years={(years || []).sort()}
          node={ref}
        />
      </div>  
      <div style={{ height: "800px" }} ref={setRef}>
        {data?.length ? (
          <>
            {chartType === "bar" ? (
              <BarChart barData={data} activeVar={filters?.activeVar?.value} filters={filters}/>
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

export default ChartPage;
