import { HUBBOUND_ATTRIBUTES } from "../constants";
const HEADER_PROP_NAMES = ["location_name", "sector_name", "transit_mode_name"];

const HubboundMapHover = ({ data, layer }) => {
  const dataProps = data[2];
  const routeData = JSON.parse(dataProps.routes);
console.log("map hover data", dataProps)
  return (
    <div className="bg-white px-4 py-2 max-w-[300px] scrollbar-xs overflow-y-scroll">
      {HEADER_PROP_NAMES.map((propName) => (
        <div className="flex border-b pt-1 capitalize" key={`col-${propName}`}>
          <div className="flex-1 font-medium text-sm pl-1">
            {propName.split("_").join(" ")}
          </div>
          <div className="flex-1 text-right font-thin pl-4 pr-1">
            {dataProps[propName]}
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
          {HUBBOUND_ATTRIBUTES.count_variable_name.values.map((varName) => (
            <div
              className="flex border-b pt-1"
              key={`route_${routeName}_${varName}`}
            >
              <div className="flex-1 font-medium text-sm pl-1">{varName}</div>
              <div className="flex-1 text-right font-thin pl-4 pr-1">
                {routeData[routeName][varName]}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { HubboundMapHover };
