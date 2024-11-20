import React, { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { get } from "lodash";

import { DamaContext } from "~/pages/DataManager/store";
import { ResponsiveBar } from "@nivo/bar";
const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
  county: {name: "County" }
};

const Title = (props) => {
  let { width, height, filters, sourceType } = props;
  if (props.bars && props.bars.length > 0) {
    filters = props.bars[0].data.data.filters;
    sourceType = props.bars[0].data.data.sourceType;
  }

  const style = { fontWeight: "bold", textTransform: "capitalize" };



  const activeVar = filters?.activeVar.value || "";
  const summarize = filters?.summarize.value || "";
  const area = filters?.area.value || "";
  const aggFunc = filters?.aggregate?.value || "";
  const timePeriod = filters?.['period']?.value || null;
  const functionalClass = filters?.['functional_class']?.value || null;

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const transformAggFunc = {
    'avg' : "Average",
    'sum' : "Sum"
  }


  return (
    <>
      <text x={5} y={-50} style={style}>
        {activeVar} {`by ${summarizeVars[summarize]?.name}`}
      </text>
      <text x={5} y={-30} style={style}>
        {functionalClass} | {timePeriod?.replace("_"," ")}
      </text>
      <text x={5} y={-10} style={style}>
        {area === "all" ? "All Areas" : capitalizeFirstLetter(area)} {summarize !== 'county' ? `| ${transformAggFunc[aggFunc]} of Counties within ${summarizeVars[summarize]?.name}` : ''}
      </text>
    </>
  );
};

const ChartPage = ({
  views,
  source,
  transform = () => null,
  filterData = {},
  ChartFilter = <div />,
  userHighestAuth
}) => {
  const { viewId } = useParams();
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  const [filters, _setFilters] = useState(filterData);
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);

  const activeViewId = useMemo(() => {
    return get(
      views.filter((d) => d.view_id === viewId),
      "[0]",
      views[0]
    )?.view_id;
  }, [views, viewId]);

  const dataLength = React.useMemo(() => {
    return get(
      falcorCache,
      ["dama", pgEnv, "viewsbyId", activeViewId, "data", "length"],
      "No Length"
    );
  }, [pgEnv, activeViewId, falcorCache]);

  const attributes = React.useMemo(() => {
    
    let md = get(source, ["metadata", "columns"], get(source, "metadata", []));
    if (!Array.isArray(md)) {
      md = [];
    }

    return md
      .filter((d) => ["integer", "string", "number"].includes(d.type))
      .map((d) => d.name);
  }, [source]);

   React.useEffect(() => {
    if (dataLength > 0) {
      let maxData = Math.min(dataLength, 10000);
      falcor
        .get(
          [
            "dama",
            pgEnv,
            "viewsbyId",
            activeViewId,
            "databyIndex",
            Array.from(Array(maxData-1).keys()),//{"from":0, "to": maxData-1},
            attributes,
          ]
        )
        .then((d) => {
          console.timeEnd("getViewData", maxData);
        });
    }
  }, [pgEnv, activeViewId, dataLength, attributes]);

  const valueMap = React.useMemo(() => {
    let maxData = Math.min(dataLength, 5000);

    let data = Object.values(
      get(
        falcorCache,
        ["dama", pgEnv, "viewsbyId", activeViewId, "databyIndex"],
        []
      )
    ).map((d) => get(falcorCache, d.value, {}));

    //console.log('attr data from cache', data)

    return data;
  }, [pgEnv, activeViewId, falcorCache, dataLength]);

  let { data } = useMemo(
    () =>
      transform({
        valueMap,
        filters
      }),
    [valueMap, transform, filters]
  );

  const [ref, setRef] = React.useState(null);
  return (
    <div>
      <div className="flex flex-1">
        <ChartFilter
          userHighestAuth={userHighestAuth}
          filters={filters}
          setFilters={setFilters}
          source={source}
          activeViewId={activeViewId}
          node={ref}
        />
        
      </div>
      <div style={{ height: "800px" }} ref={setRef}>
      {data?.length ?  (
        <ResponsiveBar
          layers={['grid', 'axes', 'bars', 'totals', 'markers', 'legends', 'annotations', Title]}
          filters={filters}
          data={data.map(datum => ({...datum, filters}))}
          keys={["value"]}
          indexBy="id"
          valueFormat={v => v.toLocaleString()}
          margin={{ top: 75, right: 60, bottom: 50, left: 150 }}
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
          axisLeft={{
            tickSize:0
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: filters?.activeVar?.value,
            legendPosition: "middle",
            legendOffset: 36,
            format: v => v.toLocaleString()
          }}
          tooltip={({ value, color, data } ) => {
            return <div
                style={{
                    padding: 12,
                    color,
                    background: '#FFFFFF',
                    border: '1px solid black'
                }}
            >
                {data?.id}
                <br />
                <strong>
                  {data.variable}: {value?.toLocaleString()}
                </strong>
            </div>
          }}
          enableGridX={true}
          enableGridY={false}
          enableLabel={true}
          label={({value}) => <>{value.toLocaleString()}</>}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          isInteractive={true}
          legends={[]}
        />) : (
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
