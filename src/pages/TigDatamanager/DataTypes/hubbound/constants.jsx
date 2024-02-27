const finishYear = 2020;
const startYear = 2007
 
const STATION_NAMES = [
  "York Street",
  "Whitehall Street",
  "Wall Street",
  "Vernon Blvd/Jackson Ave",
  "Times Square",
  "Roosevelt Island",
  "Queens Plaza",
  "Queensboro Plaza",
  "Pacific Street",
  "Marcy Avenue",
  "Lexington Av/63rd St",
  "High Street",
  "Grand Street",
  "Grand Central",
  "First Avenue",
  "Essex Street",
  "East Broadway",
  "Dekalb Avenue",
  "Court Street",
  "Clark Street",
  "Canal Street",
  "Broadway/Nassau",
  "Broad Street",
  "Bowling Green",
  "Borough Hall",
  "Bedford Avenue",
  "86th St / Lexington Ave",
  "72nd St / Broadway",
  "68th St / Lexington Ave",
  "66th St / Broadway",
  "63rd St / Lexington Ave",
  "59th St / Lexington Ave",
  "59th St /Columbus Circle",
  "59th St / Columbus Circle",
  "57th St/7th Av",
  "53rd St / Lexington Ave",
  "23rd St/Ely Ave",
  "125th St / Nicholas St",
];

const LOCATION_NAMES = [
  "Sixtieth St. Tunnel-BMT/IND",
  "Joralemon Tunnel-IRT",
  "Fifty-Third St. Tunnel-IND",
  "Rutgers Tunnel-IND",
  "Sixty-Third St. Tunnel",
  "Fourtheenth St. Tunnel-BMT",
  "Manhattan Bridge-BMT",
  "Clark Tunnel-IRT",
  "Lexington Av/63rd St",
  "Steinway Tunnel-IRT",
  "Lexington Avenue- IRT",
  "Broadway",
  "Montague Tunnel-BMT",
  "57th St/7th Av",
  "Eight Ave",
  "Williamsburg Bridge-BMT",
  "Cranberry Tunnel-IND",
];

const SECTOR_NAMES = ["Queens", "Brooklyn", "60th Street Sector"];

const TRANSIT_MODES = [
  "Rail Rapid Transit - Local",
  "Rail Rapid Transit - Express",
];

const AGENCY_NAMES = ["MTA NYC Transit"];

const VARIABLE_NAMES = [
  "Passengers",
  "Trains",
  "Cars in Trains",
  // "Buses",
  // "Vehicles",
  // "Occupancy Rates",
];

const ROUTE_NAMES = [
  "B",
  "V",
  "7",
  "D",
  "J/Z",
  "5",
  "N",
  "6",
  "Q",
  "3",
  "2",
  "E",
  "R",
  "W",
  "A",
  "C",
  "1",
  "M",
  "L",
  "F",
  "4",
];

export const HUBBOUND_ATTRIBUTES = {
  direction: { values: ["Outbound", "Inbound"] },
  year: {
    values: Array.from(
      { length: finishYear - startYear },
      (_, i) => startYear + 1 + i
    ),
  },
  hour: { values: Array.from({ length: 24 }, (_, i) => -1 + 1 + i) },
  count: {},
  count_variable_name: {
    values: VARIABLE_NAMES,
  },
  in_station_name: { values: STATION_NAMES },
  out_station_name: { values: STATION_NAMES },
  transit_mode_name: { values: TRANSIT_MODES },
  sector_name: { values: SECTOR_NAMES },
  transit_agency_name: { values: AGENCY_NAMES },
  transit_route_name: {
    values: ROUTE_NAMES,
  },
  location_name: { values: LOCATION_NAMES },
};