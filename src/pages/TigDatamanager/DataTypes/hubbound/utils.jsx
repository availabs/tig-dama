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