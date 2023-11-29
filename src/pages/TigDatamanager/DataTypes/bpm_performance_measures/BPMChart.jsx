import React, { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { get } from "lodash";

import { DamaContext } from "~/pages/DataManager/store";
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

const ChartPage = ({
  views,
  source,
  transform = () => null,
  filterData = {},
  ChartFilter = <div />,
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
          filters={filters}
          setFilters={setFilters}
          source={source}
          activeViewId={activeViewId}
          node={ref}
        />
        
      </div>
      <div style={{ height: "600px" }} ref={setRef}>
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="id"
          margin={{ top: 20, right: 60, bottom: 50, left: 130 }}
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
            legend: filters?.activeVar?.value,
            legendPosition: "middle",
            legendOffset: 36,
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
        />
      </div>
    </div>
  );
};

export default ChartPage;
