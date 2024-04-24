const finishYear = 2021;
const startYear = 2016

export const NPMRDS_ATTRIBUTES = {
  year: {
    values: [
      ...Array.from(
        { length: finishYear - startYear },
        (_, i) => startYear + 1 + i
      ),
    ],
    mapFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  hour: {
    values: Array.from({ length: 24 }, (_, i) => -1 + 1 + i),
    mapFilter: true,
    tableFilter: true,
    filterRemovable: false,
  },
  month: {
    values: [...Array.from({ length: 12 }, (_, i) => 0 + 1 + i)],
    mapFilter: true,
  },
  direction:{
    values: ['All', 'Northbound', 'Southbound', 'Eastbound', 'Westbound'],
    mapFilter: true,
    filterRemovable: true
  },
  tmc: {
    displayName: "Zoom to TMC",
    values: [],
    mapFilter: true,
    filterRemovable: true
  },
  counties: {
    values: [
      34003,
      // 34013,
      // 34017,
      // 34019,
      // 34021,
      // 34023,
      // 34025,
      // 34027,
      // 34029,
      // 34031,
      // 34035,
      // 34037,
      // 34039,
      // 36005,
      // 36027,
      // 36047,
      // 36059,
      // 36061,
      // 36071,
      // 36079,
      // 36081,
      // 36085,
      // 36087,
      // 36103,
      // 36105,
      // 36111,
      // 36119,
      // "09009",
      // "09005",
      // "09001",
    ],
    mapFilter: false,
  },
};