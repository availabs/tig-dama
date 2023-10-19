const regionalData = {
  regions: {
    "NYBPM Coounties": [
      "Bergen",
      "Bronx",
      "Dutchess",
      "Essex",
      "Fairfield",
      "Hudson",
      "Hunterdon",
      "Kings",
      "Mercer",
      "Middlesex",
      "Monmouth",
      "Morris",
      "Nassau",
      "New Haven",
      "New York",
      "Ocean",
      "Orange",
      "Passaic",
      "Putnam",
      "Queens",
      "Richmond",
      "Rockland",
      "Somerset",
      "Suffolk",
      "Sussex",
      "Union",
      "Warren",
      "Westchester",
    ],
    "NYMTC Planning Area": [
      "Bronx",
      "Kings",
      "Nassau",
      "New York",
      "Putnam",
      "Queens",
      "Richmond",
      "Rockland",
      "Suffolk",
      "Westchester",
    ],
  },
  sub_regions: {
    Connecticut: ["Fairfield", "Litchfield", "New Haven"],
    "Long Island": ["Nassau", "Suffolk"],
    "Mid Hudson": [
      "Dutchess",
      "Orange",
      "Putnam",
      "Rockland",
      "Sullivan",
      "Ulster",
      "Westchester",
    ],
    "Mid Hudson South": ["Putnam", "Rockland", "Westchester"],
    "New Jersey": [
      "Bergen",
      "Essex",
      "Hudson",
      "Hunterdon",
      "Mercer",
      "Middlesex",
      "Monmouth",
      "Morris",
      "Ocean",
      "Passaic",
      "Somerset",
      "Sussex",
      "Union",
      "Warren",
    ],
    "New York City": ["Bronx", "Kings", "New York", "Queens", "Richmond"],
  },
};

const fips2Name = {
  "34003": "Bergen",
  "34013": "Essex",
  "34017": "Hudson",
  "34019": "Hunterdon",
  "34021": "Mercer",
  "34023": "Middlesex",
  "34025": "Monmouth",
  "34027": "Morris",
  "34029": "Ocean",
  "34031": "Passaic",
  "34035": "Somerset",
  "34037": "Sussex",
  "34039": "Union",
  "34041": "Warren",
  "36005": "Bronx",
  "36027": "Dutchess",
  //"36031": "Essex",
  "36047": "Kings",
  "36059": "Nassau",
  "36061": "New York",
  "36071": "Orange",
  "36079": "Putnam",
  "36081": "Queens",
  "36085": "Richmond",
  "36087": "Rockland",
  "36103": "Suffolk",
  //"36113": "Warren",
  "36119": "Westchester",
  "09001": "Fairfield",
  "09005": "Litchfield",
  "09007": "Middlesex",
  "09009": "New Haven",
};

export { regionalData, fips2Name };
