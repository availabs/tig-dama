import React, { useContext, useMemo, useEffect, useState } from "react";
import {
  get,
  cloneDeep,
  chunk,
  isEqual,
  flattenDeep,
  uniqBy,
  set,
  unset,
  uniq,
} from "lodash";

// import { download as shpDownload } from "~/pages/DataManager/utils/shp-write";
import shpwrite from  '@mapbox/shp-write';

import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { Button, getColorRange } from "~/modules/avl-components/src";
import { useFalcor } from "~/modules/avl-components/src";
import { DamaContext } from "~/pages/DataManager/store";
import { DAMA_HOST } from "~/config";

const getTilehost = (DAMA_HOST) =>
  DAMA_HOST === "http://localhost:3369"
    ? "http://localhost:3370"
    : DAMA_HOST + "/tiles";

const TILEHOST = getTilehost(DAMA_HOST);

const DEFAULT_COLOR_SCALE = getColorRange(5, "YlOrRd", false);

const MapDataDownloader = ({
  activeVar,
  year,
  geometry,
  valueMap,
  geoids,
  viewDependency,
}) => {
  const { pgEnv, falcor, falcorCache } = React.useContext(DamaContext);
  const tempViewId = viewDependency && viewDependency[0];

  const viewYear = year - (year % 10);
  React.useEffect(() => {
    (chunk((geoids || []).map(String), 250) || []).forEach(elem => {
      falcor.get([
        "dama",
        pgEnv,
        "tiger",
        [tempViewId],
        elem,
        [viewYear],
        [geometry],
        "attributes",
        ["geoid", "wkb_geometry", "name"],
      ]);
    });
  }, [falcor, pgEnv, tempViewId, geometry, viewYear, geoids]);

  const downloadData = React.useCallback(() => {
    const collection = {
      type: "FeatureCollection",
      features: geoids.map((id) => {
        const data = get(
          falcorCache,
          [
            "dama",
            pgEnv,
            "tiger",
            tempViewId,
            id,
            viewYear,
            geometry,
            "attributes",
          ],
          {}
        );

        const value = get(valueMap, id, null);
        const county = get(data, "name", "unknown");
        const geom = get(data, "wkb_geometry", {});

        return {
          type: "Feature",
          properties: {
            [activeVar]: value,
            county,
            year,
          },
          geometry: JSON.parse(geom),
        };
      }),
    };
    const options = {
      folder: "shapefiles",
      file: activeVar,
      outputType: "blob",
      compression: "DEFLATE",
      types: {
        point: "points",
        polygon: "polygons",
        line: "lines",
      },
    };

    shpwrite.download(collection, options);
  }, [falcorCache, pgEnv, tempViewId, activeVar, year]);

  return (
    <Button
      themeOptions={{ size: "sm", color: "primary" }}
      onClick={downloadData}
    >
      Download
    </Button>
  );
};

const ACSMapFilter = ({
  filters,
  setFilters,
  setTempSymbology,
  tempSymbology,
  activeView,
  activeViewId,
  source
}) => {
  const { pgEnv } = useContext(DamaContext);
  const { falcor, falcorCache } = useFalcor();
  const [subGeoids, setSubGeoIds] = useState([]);

  const [activeVar, geometry, year] = useMemo(() => {
    return [
      filters?.activeVar?.value,
      filters?.geometry?.value || "tract",
      filters?.year?.value || 2019,
    ];
  }, [filters]);

  const viewYear = useMemo(() => year - (year % 10), [year]);
  const activeLayerId = useMemo(
    () => `${geometry}_${viewYear}`,
    [geometry, viewYear]
  );

  const metaYears = useMemo(
    () => get(activeView, "metadata.years", []).sort(),
    [activeView]
  );
  let { counties = [], variables = [] } = useMemo(
    () => get(activeView, "metadata", {}),
    [activeView, activeViewId]
  );

  const [censusConfig, divisorKeys] = useMemo(() => {
    let keys =
      (((variables || []).find((d) => d.label === activeVar) || {}).value || {})
        .censusKeys || [];
    let divisors =
      (((variables || []).find((d) => d.label === activeVar) || {}).value || {})
        .divisorKeys || [];

    keys = Array.isArray(keys) ? keys : [keys];
    divisors = Array.isArray(divisors) ? divisors : [divisors];
    return [keys, divisors];
  }, [activeVar, variables]);

  useEffect(() => {
    const updatedFilters = { ...filters };

    if (!filters?.activeVar) {
      updatedFilters.activeVar = { value: variables[0]?.label || null };
    }
    if (!filters?.activeCounties?.length) {
      let geoids;
      if (geometry === "county") {
        geoids = counties;
      } else if (geometry === "tract") {
        geoids = subGeoids;
      }
      updatedFilters.activeCounties = { value: geoids };
    }
    if (!filters?.geometry?.value) {
      updatedFilters.geometry = { value: geometry };
    }

    setFilters(updatedFilters);
  }, [geometry, activeVar, counties, subGeoids]);

  useEffect(() => {
    async function getViewData() {
      await falcor.get([
        "dama",
        pgEnv,
        "views",
        "byId",
        activeView?.view_dependencies,
        "attributes",
        "metadata",
      ]);
    }
    getViewData();
  }, [pgEnv, activeViewId, activeView]);

  useEffect(() => {
    async function getViewData() {
      falcor
        .get([
          "dama",
          [pgEnv],
          "tiger",
          activeView?.view_dependencies,
          counties.map(String),
          [viewYear],
          ["tracts"],
        ])
        .then(() => {
          const d = (counties || []).reduce((a, c) => {
            a.push(
              ...get(
                falcorCache,
                [
                  "dama",
                  pgEnv,
                  "tiger",
                  activeView?.view_dependencies[0],
                  c,
                  viewYear,
                  "tracts",
                  "value",
                ],
                []
              )
            );
            return a;
          }, []);
          setSubGeoIds(uniq(d));
        });
    }
    getViewData();
  }, [falcorCache, pgEnv, activeViewId, activeView, counties, viewYear]);

  useEffect(() => {
    const newSymbology = cloneDeep(tempSymbology || {});
    (activeView?.view_dependencies || []).forEach((v) => {
      let { sources, layers } = get(
        get(falcorCache, ["dama", pgEnv, "views", "byId", v, "attributes"], {}),
        ["metadata", "value", "tiles"],
        {}
      );
      if (sources && sources.length) {
        (sources || []).forEach((s) => {
          if (s && s.source)
            s.source.url = s?.source?.url?.replace("$HOST", TILEHOST);
            s.source.url = s.source.url
              .replace('https://', 'pmtiles://')
              .replace('http://', 'pmtiles://')

        });
      }

      if (!newSymbology.hasOwnProperty("sources")) {
        newSymbology["sources"] = sources || [];
      } else {
        if (sources) newSymbology["sources"].push(flattenDeep(sources));
      }

      if (!newSymbology.hasOwnProperty("layers")) {
        newSymbology["layers"] = layers || [];
      } else {
        if (layers) newSymbology["layers"].push(flattenDeep(layers));
      }
    });

    newSymbology["sources"] = uniqBy(
      flattenDeep(newSymbology["sources"]),
      "id"
    );
    newSymbology["layers"] = uniqBy(flattenDeep(newSymbology["layers"]), "id");
    if (!isEqual(tempSymbology, newSymbology)) {
      setTempSymbology(newSymbology);
    }
  }, [falcorCache, pgEnv, activeViewId, activeView]);

  useEffect(() => {
    async function getACSData() {
      const geoids = geometry === "county" ? counties : subGeoids;
      if (geoids.length > 0) {
        falcor.chunk(["dama", pgEnv, "acs", activeViewId, geoids, year, [...censusConfig, ...divisorKeys]]);
      }
    }
    getACSData();
  }, [counties, subGeoids, censusConfig, divisorKeys, year, geometry]);

  const mappedValues = useMemo(() => {
    let geoids;
    let activeLayer = (tempSymbology["layers"] || []).find(
      (v) => v.id === activeLayerId
    );

    if (geometry === "county") geoids = counties;
    else if (geometry === "tract") geoids = subGeoids;

    const valueMap = (geoids || []).reduce((a, c) => {
      let censusVal = 0,
        divisorVal = 0,
        censusFlag = false,
        divisorFalg = false;

      (censusConfig || []).forEach((cc) => {
        const tmpVal = get(falcorCache, ["dama", pgEnv, "acs", activeViewId, c, year, cc], null);
        if (tmpVal !== null) {
          censusFlag = true;
          censusVal += tmpVal;
        }
      });

      let tempFlag = Boolean(divisorKeys.length);

      if (tempFlag) {
        if (divisorKeys.length > 0) {
          (divisorKeys || []).forEach((cc) => {
            const tmpVal = get(falcorCache, ["dama", pgEnv, "acs", activeViewId, c, year, cc], null);
            if (tmpVal !== null) {
              divisorFalg = true;
              divisorVal += tmpVal;
            }
          });
        }
      }

      if (tempFlag) {
        a[c] = divisorFalg
          ? censusVal > 0
            ? Math.round((censusVal / divisorVal) * 100)
            : 0
          : null;
      } else {
        a[c] = censusFlag ? censusVal : null;
      }
      return a;
    }, {});

    const ckmeansLen = Math.min((Object.values(valueMap) || []).length, 5);
    const values = Object.values(valueMap || {});
    let domain = [0, 10, 25, 50, 75, 100];
    if (ckmeansLen <= values.length) {
      domain = ckmeans(values, ckmeansLen) || [];
    }

    let range = DEFAULT_COLOR_SCALE;

    const fullActiveVar = activeView.metadata.variables.find(variable => variable.label === activeVar);
    if (fullActiveVar) {
      if (fullActiveVar?.value?.colorScale && fullActiveVar.value.colorScale !== "") {
        range = fullActiveVar.value.colorScale;
      }
    }

    if (!(domain && domain?.length > 5)) {
      const n = domain?.length || 0;
      for (let i = n; i < 5; i++) {
        domain.push(domain[i - 1] || 0);
      }
    }

    function colorScale(domain, areaValue) {
      let color = range[0];
      (domain || []).forEach((domainValue, i) => {
        if (areaValue >= domainValue && (!domain[i+1] || areaValue <= domain[i + 1])) {
          color = range[i];
        }
      });
      return color;
    }

    const colors = {};
    Object.keys(valueMap).forEach((geoid) => {
      colors[geoid] = colorScale(domain, valueMap[geoid]);
    });

    let output = [
      "case",
      ["has", ["to-string", ["get", "geoid"]], ["literal", colors]],
      ["get", ["to-string", ["get", "geoid"]], ["literal", colors]],
      "rgba(0,0,0,0.0)",
    ];

    let newSymbology = Object.assign({}, cloneDeep(tempSymbology));
    if (activeVar && activeLayer) {
      (newSymbology?.layers || []).forEach((l) => {
        unset(newSymbology, `${l?.id}`);
        // set(newSymbology, `${l?.id}.visibility.default.value`, "none");
        set(newSymbology, `${l?.id}.fill-color.default.value`, "rgba(0,0,0,0)");
        // set(newSymbology, `${l?.id}.visibility.default.`, "none");
      });

      set(newSymbology, `${activeLayer.id}.fill-color.${activeVar}`, {
        type: "threshold",
        settings: {
          range: range,
          domain: domain,
          title: activeVar,
        },
        value: output,
      });
      unset(newSymbology, `${activeLayer.id}.layout`);
    }
    if (!isEqual(tempSymbology, newSymbology)) {
      setTempSymbology(newSymbology);
    }
    return valueMap;
  }, [
    tempSymbology,
    activeLayerId,
    activeViewId,
    censusConfig,
    divisorKeys,
    falcorCache,
    activeView,
    subGeoids,
    activeVar,
    geometry,
    year,
  ]);

  return (
    <div className="flex justify-start content-center flex-wrap w-full p-1">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Variable: </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={activeVar}
          onChange={(e) => {
            setFilters({
              ...filters,
              activeVar: { value: `${e.target.value}` },
            });
          }}
        >
          {(variables || []).map((k, i) => (
            <option key={i} className="ml-2 truncate" value={k?.label}>
              {k?.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Type: </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={geometry}
          onChange={(e) => {
            setFilters({
              ...filters,
              geometry: {
                value: `${e.target.value}`,
              },
            });
          }}
        >
          {["tract", "county"].map((v, i) => (
            <option key={i} className="ml-2 truncate" value={v}>
              {v?.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">Year:</div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={year}
          onChange={(e) => {
            setFilters({
              ...filters,
              year: {
                value: `${e.target.value}`,
              },
            });
          }}
        >
          {(metaYears || []).map((k, i) => (
            <option key={i} className="ml-2 truncate" value={k}>
              {`${k}`}
            </option>
          ))}
        </select>
      </div>

      <div className=" flex px-2 ml-auto">
        <MapDataDownloader
          activeViewId={activeViewId}
          variable={activeVar}
          activeVar={activeVar}
          year={year}
          geometry={geometry}
          valueMap={mappedValues}
          geoids={geometry === "county" ? counties : subGeoids}
          viewDependency={activeView?.view_dependencies}
        />
      </div>
    </div>
  );
};

export default ACSMapFilter;
