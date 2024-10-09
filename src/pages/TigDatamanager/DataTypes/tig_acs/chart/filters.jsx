import React, { useMemo } from "react";
import { get, sum, mean } from "lodash";
import { useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import download from "downloadjs";

import { Button } from "~/modules/avl-components/src";
import { fips2Name, regionalData } from "./../../constants";

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
};

const areas = [
  ...Object.keys(regionalData?.regions || {}),
  ...Object.keys(regionalData?.sub_regions || {}),
];

export const AcsChartFilters = ({
  filters,
  setFilters,
  variables,
  years,
  node,
}) => {
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let area = useMemo(() => get(filters, "area.value", "all"), [filters]);
  let year = useMemo(() => get(filters, "year.value", ""), [filters]);
  let summarize = useMemo(() => get(filters, "summarize.value", ""), [filters]);
  let chartType = useMemo(
    () => get(filters, "chartType.value", "bar"),
    [filters]
  );

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  React.useEffect(() => {
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${searchVar}` },
        });
      } else {
        setFilters({
          activeVar: { value: variables[0].label },
        });
      }
    }
  }, [activeVar, setFilters, searchVar, variables]);

  React.useEffect(() => {
    const update = {};
    if (!get(filters, "summarize.value", null)) {
      update.summarize = { value: "county" };
    }
    if (!get(filters, "year.value", null)) {
      update.year = { value: "2019" };
    }
    if (!get(filters, "chartType.value", null)) {
      update.chartType = { value: "bar" };
    }
    setFilters(update);
  }, [variables]);

  const downloadImage = React.useCallback(() => {
    if (!node) return;
    toPng(node, { backgroundColor: "#fff" }).then((dataUrl) => {
      download(dataUrl, `${activeVar}.png`, "image/png");
    });
  }, [node, activeVar]);

  return (
    <div className="flex justify-start content-center flex-wrap w-full p-1">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        Area:{" "}
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
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
            <option key={i} className="ml-2 truncate" value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        Summarize:{" "}
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={summarize}
          onChange={(e) =>
            setFilters({ ...filters, summarize: { value: e.target.value } })
          }
        >
          <option className="ml-2 truncate" value={"county"}>
            county
          </option>
          {area === "all" ? (
            <>
              {Object.keys(summarizeVars).map((k, i) => (
                <option key={i} className="ml-2 truncate" value={k}>
                  {summarizeVars[k]?.name}
                </option>
              ))}
            </>
          ) : null}
        </select>
      </div>
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        Variable:{" "}
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={activeVar}
          onChange={(e) =>
            setFilters({ ...filters, activeVar: { value: e.target.value } })
          }
        >
          {(variables.filter((v) => {
            const hasNoDivisorKey = !v?.value?.divisorKeys || v?.value?.divisorKeys === "" || v?.value?.divisorKeys?.length === 0;
            return filters?.chartType?.value !== 'pie' || hasNoDivisorKey
          }) || []).map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k.label}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={chartType}
          onChange={(e) =>
            setFilters({ ...filters, chartType: { value: e.target.value } })
          }
        >
          <option className="ml-2 truncate" value="bar">
            Bar
          </option>
          <option className="ml-2 truncate" value="pie">
            Pie
          </option>
        </select>
      </div>
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        Year:{" "}
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={year}
          onChange={(e) =>
            setFilters({ ...filters, year: { value: e.target.value } })
          }
        >
          {(years || []).map((y, i) => (
            <option key={i} className="ml-2  truncate" value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="flex px-2 ml-auto">
        <Button
          themeOptions={{ size: "sm", color: "primary" }}
          onClick={downloadImage}
        >
          Download
        </Button>
      </div>
    </div>
  );
};

const getRegionalgeoids = (fips2Name, countyNames) => {
  const geoids = [];

  for (const key in fips2Name) {
    if (countyNames.includes(fips2Name[key])) {
      geoids.push(key);
    }
  }
  return geoids;
};

const getAreaToGeos = (regionalData, fips2Name) => {
  const temp = {};
  Object.keys(regionalData).forEach((cc) => {
    Object.keys(regionalData[`${cc}`]).forEach((c) => {
      temp[`${c}`] = getRegionalgeoids(
        fips2Name,
        regionalData[`${cc}`][`${c}`] || []
      );
    });
  });

  temp.all =
    Object.keys(fips2Name) ||
    Object.values(fips2Name).reduce((a, c) => {
      return {
        ...a,
        [`${c}`]: getRegionalgeoids(fips2Name, [c]),
      };
    }, {});
  return temp;
};

export const ACSChartTransform = ({ valueMap, filters, isDivisor }) => {
  let summarize = get(filters, "summarize.value", "county");
  let area = get(filters, "area.value", "all");

  const areaToGeos = getAreaToGeos(regionalData, fips2Name);

  let finalchartData = [];
  let keys = [];

  if (summarize === "county") {
    keys = areaToGeos?.[`${area}`];
    finalchartData = keys.map((key) => ({
      id: fips2Name[`${key}`],
      name: fips2Name[`${key}`],
      value: valueMap[`${key}`],
    }));
  } else {
    if (summarize === "region") {
      keys = Object.keys(regionalData?.regions);
    } else if (summarize === "subRegion") {
      keys = Object.keys(regionalData?.sub_regions);
    }

    finalchartData = keys.map((key) => ({
      id: key,
      name: key,
      value: isDivisor
        ? `${
            Math.round(
              mean(
                areaToGeos[`${key}`]
                  .map((val) => +valueMap[`${val}`])
                  .filter(Boolean) || []
              )
            ) || 0
          }%`
        : sum(
            areaToGeos[`${key}`]
              .map((val) => valueMap[`${val}`])
              .filter(Boolean) || []
          ),
    }));
  }

  return {
    data: finalchartData,
  };
};
