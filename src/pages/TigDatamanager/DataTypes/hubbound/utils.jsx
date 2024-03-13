import { HUBBOUND_ATTRIBUTES } from "./constants"

export const aggHubboundByLocation = (data) => {
  return data.reduce((a, tData) => {
    const { latitude: lat, longitude: lng, ...rest } = tData;

    //for each lng, lon
    //route name : { [count_variable_name] : value }
   
    if(!a[tData.location_name]){
      a[tData.location_name] = {
        type: "Feature",
        properties: {
          ...rest,
          ogc_fid: rest['location_name'],
          routes: {},
        },
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
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

    if (
      !a[tData.location_name]["properties"]["routes"][tData.transit_route_name][
        tData.count_variable_name
      ]
    ) {
      a[tData.location_name]["properties"]["routes"][tData.transit_route_name][
        tData.count_variable_name
      ] = 0;
    }

    a[tData.location_name]["properties"]["routes"][
      tData.transit_route_name
    ][tData.count_variable_name] += tData.count;

    return a;
  }, {})
}

export const createHubboundFilterClause = (filters) => {
  const filterClause = Object.keys(filters).reduce((a, c) => {
    if (filters[c].value && filters[c].value !== "all") {
      if (HUBBOUND_ATTRIBUTES[c].type === "range") {
        const rangeLength =
          filters[c].value.length === 2
            ? Math.abs(filters[c].value[1] - filters[c].value[0]) + 1
            : 1;

        const rangeStart = filters[c].value[0] > filters[c].value[1] ? filters[c].value[1] : filters[c].value[0]
        a[c] = [
          Array.from(
            { length: rangeLength },
            (_, i) => -1 + 1 + i + rangeStart
          ),
        ];
      } else {
        a[c] = [filters[c].value];
      }
    }

    return a;
  }, {});

  return JSON.stringify({
    filter: filterClause,
  });
};