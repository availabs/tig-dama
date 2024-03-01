import { HUBBOUND_ATTRIBUTES } from "./constants"

export const aggHubboundByLocation = (data) => {
  return data.reduce((a, tData) => {
    const { latitude: lat, longitude: lng, ...rest } = tData;

    //for each lng, lon
    //route name : { [count_variable_name] : value }
   
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
  }, {})
}

export const createHubboundFilterClause = (filters) => {
  const filterClause = Object.keys(filters).reduce((a,c) => {
    if(filters[c].value && filters[c].value !== "all"){
      if(HUBBOUND_ATTRIBUTES[c].type === "range"){
        const rangeLength = Math.abs(filters[c].value[1] - filters[c].value[0]) + 1;
        console.log("rangeLength",rangeLength);
        a[c] = [Array.from({ length: rangeLength }, (_, i) => -1 + 1 + i+filters[c].value[0])]
        console.log(a[c])
      }
      else{
        a[c] = [filters[c].value];
      }

    }


    return a;
  }, {});
  console.log("createHubboundFilterClause filterClause",filterClause)
  return JSON.stringify({
    filter: filterClause,
  });
}