const finishYear = 2020;
const startYear = 2007

export const NPMRDS_ATTRIBUTES = {
  year: {
    values: [
      "all",
      ...Array.from(
        { length: finishYear - startYear },
        (_, i) => startYear + 1 + i
      ),
    ],
    mapFilter: true,
    tableFilter: true,
    filterRemovable: true,
  },
  month:{
    values: [
      "all",
      ...Array.from(
        { length: 12 },
        (_, i) => 0 + 1 + i
      ),
    ],
    mapFilter: true,
  },
  geoids:{
    values:[1001],
    mapFilter: true,
  }
}