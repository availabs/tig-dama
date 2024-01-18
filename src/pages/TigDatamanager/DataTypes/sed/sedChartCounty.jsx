import React, { useMemo } from "react";
import get from "lodash/get";
import sumBy from "lodash/sumBy";
import { regionalData } from "../constants/index";
import { Button } from "~/modules/avl-components/src"
import { toPng } from "html-to-image"
import download from "downloadjs"

import { useSearchParams } from "react-router-dom";


const defaultRange = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026']
const defaultDomain = [0,872,2047,3649,6934,14119,28578]
const sedVars = {
    "tot_pop": {name: 'Total Population (in 000s)', domain: [0,74,213,481,750,1134,2801], range: defaultRange},
    "tot_emp": {name: 'Total Employment', domain: defaultDomain, range: defaultRange},
    "emp_pay": {name: 'Payroll Employment', domain: defaultDomain, range: defaultRange},
    "emp_prop": {name: 'Proprietors Employment', domain: defaultDomain, range: defaultRange},
    "hh_pop": {name: 'Household Population', domain: defaultDomain, range: defaultRange},
    "gq_pop": {name: 'Group Quarters Population', domain: defaultDomain, range: defaultRange},
    "hh_num": {name: 'Households', domain: defaultDomain, range: defaultRange},
    "hh_size": {name: 'Household Size', domain: defaultDomain, range: defaultRange},
    "emplf": {name: 'Employed Labor Force (in 000s)', domain: defaultDomain, range: defaultRange},
    "lf": {name: 'Labor Force', domain: defaultDomain, range: defaultRange}
}

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
};

const areas = [
  ...Object.keys(regionalData?.regions || {}),
  ...Object.keys(regionalData?.sub_regions || {}),
];



const SedChartFilterCounty = ({ source, filters, setFilters, node }) => {

  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let area = useMemo(() => get(filters, "area.value", ""), [filters]);
  let summarize = useMemo(() => get(filters, "summarize.value", ""), [filters]);

  // React.useEffect(() => {
  //   if (!get(filters, "activeVar.value", null)) {
  //     setFilters({
  //       ...filters,
  //       area: { value: "all" },
  //       activeVar: { value: "tot_pop" },
  //       summarize: { value: "region" },
  //     });
  //   }
  //   if (!get(filters, "area.value", null)) {
  //     setFilters({
  //       ...filters,
  //       area: { value: "all" },
  //       activeVar: { value: "tot_pop" },
  //       summarize: { value: "region" },
  //     });
  //   }
  //   if (!get(filters, "summarize.value", null)) {
  //     setFilters({
  //       ...filters,
  //       area: { value: "all" },
  //       activeVar: { value: "tot_pop" },
  //       summarize: { value: "region" },
  //     });
  //   }
  // }, []);

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  React.useEffect(() => {
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${ searchVar }` },
        });
      }
      else {
        setFilters({
          activeVar: { value: "tot_pop" },
        });
      }
    }
  }, [activeVar, setFilters, searchVar]);

  React.useEffect(() => {
    const update = {};
    if (!get(filters, "area.value", null)) {
      update.area = { value: "all" };
    }
    if (!get(filters, "summarize.value", null)) {
      update.summarize = { value: "region" };
    }
    setFilters(update);
  }, []);

  const downloadImage = React.useCallback(() => {
    if (!node) return;
    const name = get(sedVars, [activeVar, "name"], null);
    if (!name) return;
    toPng(node, { backgroundColor: "#fff" })
      .then(dataUrl => {
        download(dataUrl, `${ name }.png`, "image/png");
      });
  }, [node, activeVar]);

  return (
    <div className="flex border-blue-100">
      <div>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ downloadImage }
        >
          Download
        </Button>
      </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Area: </div>
      <div className="flex-none w-48">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={area}
          onChange={(e) =>
            setFilters({
              ...filters,
              area: { value: e.target.value },
              summarize: {
                value: e.target.value === "all" ? summarize : "county",
              },
            })
          }
        >
          <option className="ml-2  truncate" value={"all"}>
            All
          </option>
          {(areas || []).map((area, i) => (
            <option key={i} className="ml-2  truncate" value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Summarize: </div>
      <div className="flex-none w-48">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={summarize}
          onChange={(e) =>
            setFilters({ ...filters, summarize: { value: e.target.value } })
          }
        >
          <option className="ml-2  truncate" value={"county"}>
            county
          </option>
          {area === "all" ? (
            <>
              {Object.keys(summarizeVars).map((k, i) => (
                <option key={i} className="ml-2  truncate" value={k}>
                  {summarizeVars[k]?.name}
                </option>
              ))}
            </>
          ) : null}
        </select>
      </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Variable: </div>
      <div className="flex-none w-64">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={activeVar}
          onChange={(e) =>
            setFilters({ ...filters, activeVar: { value: e.target.value } })
          }
        >
          <option className="ml-2  truncate" value={""}>
            none
          </option>
          {Object.keys(sedVars).map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k}>
              {sedVars[k].name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const getSelectedArea = (area, groupByTableData) => {
  let selectedGroupByTableData = {};
  if (regionalData?.regions?.hasOwnProperty(area)) {
    regionalData?.regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData[key];
    });
  } else if (regionalData?.sub_regions?.hasOwnProperty(area)) {
    regionalData?.sub_regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData[key];
    });
  }
  return selectedGroupByTableData;
};

const SedChartTransformCounty = (tableData, attributes, filters, years, flag) => {
  let activeVar = get(filters, "activeVar.value", "tot_pop");
  let summarize = get(filters, "summarize.value", "county");
  let area = get(filters, "area.value", "all");

  let updatedYears = years?.map((str) => (''+str).slice(-2));

  const columns = [];
  (updatedYears || []).forEach((y, i) => {
    (columns || []).push({
      Header: `20${y}`,
      accessor: `${activeVar}_${i}`,
      groupFunction: sedVars[activeVar].groupFunction || sumBy
    });
  });

  /**
   * GroupBy county_nam
   */
  let groupByTableData = (tableData || []).reduce((g, d) => {
    const { county } = d;
    if (county !== null) {
      g[`${county}`] = g[`${county}`] ?? [];
      g[`${county}`].push(d);
    }
    return g;
  }, {});

  if (area !== "all") {
    groupByTableData = getSelectedArea(area, groupByTableData);
  }

  const getSum = (accessor, summarizeKeys, groupByTableData) => {
    let sum = 0, count = 0;
    (summarizeKeys || []).forEach((k) => {
      const selectedCounty = groupByTableData[`${k}`] || {};
      sum += Math.floor(sumBy(selectedCounty, `${accessor}`) || 0);
      count += selectedCounty.length || 0;
    });
    return { sum, count };
  };

  /**
   * Modify graph data accordingly
   */
  let finalGraphData = new Array(Object.keys(groupByTableData).length).fill({});
  if (flag === "group_by_county") {
    if (summarize !== "county") {
      const keys =
        summarize === "subRegion"
          ? regionalData?.sub_regions
          : regionalData?.regions;
      finalGraphData = new Array(Object.keys(keys).length).fill({});
      finalGraphData = Object.keys(keys).map((key) => ({
        id: key,
        name: key,
        data: (columns || []).map((col) => {
          const sum = getSum(col?.accessor, keys[`${key}`], groupByTableData);

          let yValue = sum.sum;
          if (activeVar === "hh_size") {
            yValue = yValue / sum.count;
          }

          return {
            x: col?.Header,
            y: yValue,
          };
        }),
      }));
    } else {
      finalGraphData = Object.keys(groupByTableData).map((key) => ({
        id: key,
        name: key,
        data: (columns || []).map((col) => ({
          x: col?.Header,
          y: Math.floor(
            sumBy(groupByTableData[`${key}`], `${col.accessor}`) || 0
          ),
        })),
      }));
    }
  }
  return {
    data: finalGraphData,
    columns,
  };
};

export { SedChartFilterCounty, SedChartTransformCounty };
