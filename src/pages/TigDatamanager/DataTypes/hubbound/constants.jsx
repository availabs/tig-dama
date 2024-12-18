const finishYear = 2022;
const startYear = 2018;

function alphaSort(a, b) {
  if (a < b) {
    return -1;
  } else if (b < a) {
    return 1;
  } else {
    return 0;
  }
}

export const MAP_BOUNDS = [[-73.9616912861, 40.7542415367], [-73.9890044908, 40.7095419789]];

const STATION_NAMES = [
  "Pacific Street",
  "High Street",
  "Roosevelt Island",
  "59th St / Lexington Ave",
  "59th St /Columbus Circle",
  "63rd St / Lexington Ave",
  "66th St / Broadway",
  "Times Square",
  "Grand Street",
  "Whitehall Street",
  "Wall Street",
  "Queens Plaza",
  "86th St / Lexington Ave",
  "Borough Hall",
  "Bowling Green",
  "53rd St / Lexington Ave",
  "Bedford Avenue",
  "68th St / Lexington Ave",
  "Dekalb Avenue",
  "Canal Street",
  "Vernon Blvd/Jackson Ave",
  "Grand Central",
  "59th St / Columbus Circle",
  "72nd St / Broadway",
  "York Street",
  "Lexington Av/63rd St",
  "Marcy Avenue",
  "Broadway/Nassau",
  "Queensboro Plaza",
  "125th St / Nicholas St",
  "Clark Street",
  "First Avenue",
  "Broad Street",
  "57th St/7th Av",
  "23rd St/Ely Ave",
  "East Broadway",
  "Court Street",
  "Essex Street",
];
STATION_NAMES.sort(alphaSort);

const LOCATION_NAMES = [
  "All Ferry Points - 60th Street",
  "Holland Tunnel",
  "Downtown Path Tunnel",
  "Fifty-Third St. Tunnel-IND",
  "Rutgers Tunnel-IND",
  "E Koch Queensboro Brdg Ramp",
  "Sixty-Third St. Tunnel",
  "Brooklyn Bridge",
  "Amsterdam Avenue",
  "Fifth Avenue",
  "All Ferry Points-Staten Island",
  "West Side Highway",
  "Hugh L. Carey / Brooklyn Battery Tunnel",
  "West End Avenue",
  "Uptown Path Tunnel",
  "Lexington Avenue- IRT",
  "Broadway",
  "Lincoln Tunnel",
  "Eight Ave",
  "Williamsburg Bridge-BMT",
  "Cranberry Tunnel-IND",
  "All Ferry Points - Queens",
  "Staten Island Ferry",
  "Sixtieth St. Tunnel-BMT/IND",
  "Columbus Avenue",
  "Amtrak/N.J. Transit Tunnels",
  "Joralemon Tunnel-IRT",
  "Queens Midtown Tunnel-IRT",
  "Seventh Avenue",
  "Fourtheenth St. Tunnel-BMT",
  "Franklin D. Roosevelt Drive",
  "E Koch Queensboro Brdg or Roosevelt Island Tramway",
  "Manhattan Bridge-BMT",
  "West End Avenue/11th Avenue",
  "York Avenue",
  "West Side Highway/12th Avenue",
  "Park Ave",
  "All Ferry Points - Brooklyn",
  "Madison Avenue",
  "Clark Tunnel-IRT",
  "Lexington Av/63rd St",
  "Second Avenue",
  "Third Avenue",
  "Steinway Tunnel-IRT",
  "Montague Tunnel-BMT",
  "Hudson River Greenway",
  "All Ferry Points - New Jersey",
  "Amtrak/LIRR Tunnels",
  "First Avenue",
  "57th St/7th Av",
  "Sixth Avenue",
];
LOCATION_NAMES.sort(alphaSort);


const SECTOR_NAMES = [
  "Queens",
  "Brooklyn",
  "60th Street Sector",
  "Staten Island",
  "New Jersey",
];
SECTOR_NAMES.sort(alphaSort);
SECTOR_NAMES.unshift("all");

const TRANSIT_MODES = [
  "Rail Rapid Transit - Local",
  "Rail Rapid Transit - Express",
  'Suburban Rail',
  'Tramway',
  'Express Bus',
  'Private Ferry',
  'Bicycle',
  'Local Bus',
  'Vehicles (Bus+Auto+Taxi+Trucks+Commercial Vans)',
  'Public Ferry'
];
TRANSIT_MODES.sort(alphaSort);
TRANSIT_MODES.unshift("all");
const AGENCY_NAMES = [
  "New Jersey Transit",
  "Private Ferries",
  "Port Authority of NY&NJ",
  "MTA Long Island Rail Road",
  "AMTRAK",
  "No Operators",
  "MTA Bus Company",
  "Private Bus Operators",
  "Westchester DOT",
  "MTA NYC Transit",
  "RIOC",
  "MTA Metro North Railroad",
];
AGENCY_NAMES.sort(alphaSort);


export const HUBBOUND_COUNT_VARIABLES = {
  "Passengers":{
    aggFunc: "sum"
  },
  "Trains":{
    aggFunc: "sum"
  },
  "Cars in Trains":{
    aggFunc: "sum"
  },
  "Buses":{
    aggFunc: "sum"
  },
  "Vehicles":{
    aggFunc: "sum"
  },
  "Occupancy Rates":{
    aggFunc: "avg"
  },
}

const VARIABLE_NAMES = Object.keys(HUBBOUND_COUNT_VARIABLES);
VARIABLE_NAMES.sort(alphaSort);

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
ROUTE_NAMES.sort(alphaSort);

export const HUBBOUND_ATTRIBUTES = {
  direction: {
    values: ["all","Outbound", "Inbound"],
    filterMulti: false,
    chartFilter: true,
    mapFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  year: {
    values: [
      "all",
      ...Array.from(
        { length: finishYear - startYear },
        (_, i) => startYear + 1 + i
      ),
    ],
    chartFilter: true,
    mapFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  hour: {
    values: Array.from({ length: 25 }, (_, i) => -1 + 1 + i),
    type: "range",
    mapFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  count: { tableFilter: true, filterRemovable: true, },
  count_variable_name: {
    values: VARIABLE_NAMES,
    chartFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  in_station_name: {
    values: STATION_NAMES,
    tableFilter: true,
  },
  out_station_name: {
    values: STATION_NAMES,
    tableFilter: false,
  },
  transit_mode_name: {
    values: TRANSIT_MODES,
    tableFilter: false,
    chartFilter: true,
    mapFilter: true,
  },
  sector_name: {
    values: SECTOR_NAMES,
    chartFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  transit_agency_name: {
    values: AGENCY_NAMES,
    tableFilter: true,
    filterRemovable: true,
  },
  transit_route_name: {
    values: ROUTE_NAMES,
    tableFilter: true,
    filterRemovable: true,
  },
  location_name: {
    values: LOCATION_NAMES,
    tableFilter: true,
    filterRemovable: true,
  },
  latitude: { tableFilter: false, tableColumn: false },
  longitude: { tableFilter: false, tableColumn: false },
};