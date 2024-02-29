import { useContext, useMemo } from 'react';
import get from "lodash/get";
import { DamaContext } from "~/pages/DataManager/store";
import { HUBBOUND_ATTRIBUTES } from "../constants";
const HEADER_PROP_NAMES = ["location_name", "sector_name", "transit_mode_name"];

const HubboundMapHover = ({ data, layer }) => {
  const { falcorCache, pgEnv } = useContext(DamaContext);
  const locationName = data[2]['location_name']

  const { activeViewId, props: layerProps } = layer;
  const { filters } = layerProps;

  const hubboundDetailsOptions = useMemo(() => {
    const filterClause = Object.keys(filters).reduce((a,c) => {
      if(filters[c].value && filters[c].value !== "all"){
        a[c] = [filters[c].value];
      }


      return a;
    }, {});

    return JSON.stringify({
      filter: filterClause,
    });
  }, [filters]);

  const hubboundDetailsPath = useMemo(() => {
    return [
      "dama",
      pgEnv,
      "viewsbyId",
      activeViewId,
      "options",
      hubboundDetailsOptions,
    ]
  }, [pgEnv, activeViewId, hubboundDetailsOptions] )

  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];

    const tableDataById = get(falcorCache, tableDataPath, {});

    return Object.values(tableDataById);
  }, [activeViewId, falcorCache, hubboundDetailsPath, hubboundDetailsOptions, filters]);

  const hoverData = useMemo(() => {
    return tableData.reduce((a, tData) => {
      const { latitude: lat, longitude: lng, ...rest } = tData;

      if (!a[tData.location_name]) {
        a[tData.location_name] = {
          properties: {
            ...rest,
            routes: {},
          },
        };
      }

      if (
        !a[tData.location_name]["properties"]["routes"][
          tData.transit_route_name
        ]
      ) {
        a[tData.location_name]["properties"]["routes"][
          tData.transit_route_name
        ] = {};
      }

      a[tData.location_name]["properties"]["routes"][
        tData.transit_route_name
      ][tData.count_variable_name] = tData.count;

      return a;
    }, {})[locationName]?.properties;
  }, [tableData, locationName])

  const routeData = hoverData?.routes || {};

  if(!Object.keys(routeData).length) {
    return (<></>)
  }
  return (
    <div className="bg-white px-4 py-2 max-w-[300px] scrollbar-xs overflow-y-scroll">
      {/* <div className="flex border-b pt-1 capitalize" key={`col-year`}>
        <div className="flex-1 font-medium text-sm pl-1">Year, Hour</div>
        <div className="flex-1 text-right font-thin pl-4 pr-1">
          {hoverData?.year}, {hoverData?.hour}
        </div>
      </div> */}
      {HEADER_PROP_NAMES.map((propName) => (
        <div className="flex border-b pt-1 capitalize" key={`col-${propName}`}>
          <div className="flex-1 font-medium text-sm pl-1">
            {propName.split("_").join(" ")}
          </div>
          <div className="flex-1 text-right font-thin pl-4 pr-1">
            {hoverData?.[propName]}
          </div>
        </div>
      ))}
      {Object.keys(routeData).map((routeName) => (
        <div key={`route_data_${routeName}`} className={"my-3"}>
          <div className="flex border-b pt-1">
            <div className="flex-1 font-medium text-sm pl-1">Route:</div>
            <div className="flex-1 text-right font-thin pl-4 pr-1">
              {routeName}
            </div>
          </div>
          {HUBBOUND_ATTRIBUTES.count_variable_name.values.filter(varName => routeData?.[routeName]?.[varName] !== undefined).map((varName) => (
            <div
              className="flex border-b pt-1"
              key={`route_${routeName}_${varName}`}
            >
              <div className="flex-1 font-medium text-sm pl-1">{varName}</div>
              <div className="flex-1 text-right font-thin pl-4 pr-1">
                {routeData?.[routeName]?.[varName]}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { HubboundMapHover };
