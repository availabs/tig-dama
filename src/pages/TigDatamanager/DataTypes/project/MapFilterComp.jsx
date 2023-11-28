import React, { useMemo, useEffect } from 'react'
import { useSearchParams } from "react-router-dom";
import { DamaContext } from "~/pages/DataManager/store"
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import mapboxgl from "maplibre-gl";
import { Button } from "~/modules/avl-components/src";
import shpwrite from  '@mapbox/shp-write'
import { range as d3range } from "d3-array"

const ptypes_colors = {
  BIKE: "#38A800",
  BUS: "#0070FF",
  FERRY: "#D79E9E",
  HIGHWAY: "#FFF",
  TRAFFIC: "#FFF",
  HISTORIC: "#ffeb3b",
  ITS: "#FF00C5",
  PARKING: "#496bff",
  PEDESTRIAN: "#B1FF00",
  MOBILITY: "#B1FF00",
  RAIL: "#9C9C9C",
  STUDY: "#FFAA00",
  TRANSIT: "#00C5FF",
  TRUCK: "#000",
  NULL: "rgba(0,0,0,0)",
  "": "rgba(0,0,0,0)",
};

const images = [
  { id: "BIKE", url: "/mapIcons/bike.png", color: "#38A800", type: "both" },
  { id: "BUS", url: "/mapIcons/transit.png", color: "#0070FF", type: "both" },
  { id: "HIGHWAY", url: "/mapIcons/highway.png", color: "#fff", type: "both" },
  { id: "BRIDGE", url: "/mapIcons/highway.png", color: "#fff", type: "none" },
  { id: "FERRY", url: "/mapIcons/ferry.png", color: "#D79E9E", type: "both" },
  { id: "RAIL", url: "/mapIcons/rail.png", color: "#9C9C9C", type: "both" },
  { id: "STATIONS", url: "/mapIcons/rail.png", color: "#fff", type: "none" },
  { id: "TRUCK", url: "/mapIcons/truck.png", color: "#fff", type: "both" },
  { id: "PEDESTRIAN", url: "/mapIcons/pedestrian.png", color: "#B1FF00", type: "both" },
  { id: "ITS", url: "/mapIcons/its.png", color: "#FF00C5", type: "both" },
  { id: "PARKING", url: "/mapIcons/parking.png", color: "#496bff", type: "both" },
  { id: "FREIGHT", url: "/mapIcons/truck.png", color: "#fff", type: "both" },
  { id: "TRANSIT", url: "/mapIcons/transit.png", color: "#fff", type: "both" },
  { id: "HISTORIC", url: "/mapIcons/historic.png", color: "#ffeb3b", type: "both" },
  { id: "STUDY", url: "/mapIcons/study.png", color: "#FFAA00", type: "both" },
  { id: "MOBILITY", url: "", color: "#B1FF00", type: "both" },
];

const GEOM_TYPES = {
  Point: "Point",
  MultiLineString: "MultiLineString",
  MultiPolygon: "MultiPolygon",
};

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

const tipRtpMapStyles = {
  line: {
    type: "line",
    paint: {
      "line-color": [
        "get",
        ["upcase", ["to-string", ["get", "ptype"]]],
        ["literal", ptypes_colors],
      ],
      "line-width": 3,
    },
    filter: ["all", ["==", ["geometry-type"], "LineString"]],
  },
  circle: {
    type: "symbol",
    layout: {
      "icon-image": ["upcase", ["get", "ptype"]], // reference the image
      "icon-size": 0.1,
      "icon-allow-overlap": true,
    },
    filter: ["all", ["==", ["geometry-type"], "Point"]],
  },
  fill: {
    type: "fill",
    paint: {
      "fill-color": [
        "get",
        ["upcase", ["to-string", ["get", "ptype"]]],
        ["literal", ptypes_colors],
      ],
      "fill-opacity": 0.5,
    },
    filter: ["all", ["==", ["geometry-type"], "Polygon"]],
  },
};

const ProjectMapFilter = ({
  source,
  metaData,
  filters,
  setFilters,
  setTempSymbology,
  tempSymbology,
  activeViewId,
  layer,
}) => {
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  const [searchParams] = useSearchParams();
  
  let projectKey = source?.name.includes("RTP") ? "rtp_id" : "tip_id";
  let newSymbology = cloneDeep(tempSymbology);

  const metadataColumns = (
    source?.metadata?.columns ||
    source?.metadata ||
    []
  ).map((d) => d.name);

  React.useEffect(() => {
    const loadSourceData = async () => {
      const d = await falcor.get([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "data",
        "length",
      ]);

      let length = get(
        d,
        ["json", "dama", pgEnv, "viewsbyId", activeViewId, "data", "length"],
        0
      );

      await falcor.get([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "databyIndex",
        [...Array(length).keys()],
        metadataColumns,
      ]);
    };
    loadSourceData();
  }, [pgEnv, activeViewId, source]);

  const dataById = get(
    falcorCache,
    ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"],
    {}
  );

  const dataIds = React.useMemo(() => {
    return {
      [projectKey]: [
        "",
        ...new Set(
          Object.values(dataById || {})
            .map((d) => d?.[projectKey])
            .filter((d) => d)
        ),
      ],
    };
  }, [falcorCache]);

  const allProjectIds = dataIds[projectKey]
    .filter(onlyUnique)
    .filter((val) => val !== "");
  const projectIdFilterValue = filters["projectId"]?.value || null;

  const featureId = searchParams.get("featureId")

  React.useEffect(() => {
    if (!projectIdFilterValue) {
      if (featureId) {
        setFilters({
          projectId: { value: featureId },
        });
      }
    }
  }, []);

  let projectCalculatedBounds;
  if (projectIdFilterValue) {
    const project = Object.values(dataById).find(
      (d) => d[projectKey] === projectIdFilterValue
    );
    const projectGeom = !!project?.wkb_geometry ? JSON.parse(project.wkb_geometry) : null;
    if (projectGeom?.type === GEOM_TYPES["Point"]) {
      const coordinates = projectGeom.coordinates;
      projectCalculatedBounds = new mapboxgl.LngLatBounds(
        coordinates,
        coordinates
      );
    } else if (projectGeom?.type === GEOM_TYPES["MultiLineString"]) {
      const coordinates = projectGeom.coordinates[0];
      projectCalculatedBounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    } else if (projectGeom?.type === GEOM_TYPES["MultiPolygon"]) {
      const coordinates = projectGeom.coordinates[0][0];

      projectCalculatedBounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    }
  }

  //To Populate menu/select/dropdown menu stuffs
  const allProjectTypes = Object.values(dataById)
    ?.map((val, i) => val.ptype)
    .filter(onlyUnique)
    .filter((val) => val !== "null");
  const projectTypeFilterValue = filters["ptype"]?.value || null;

  const allSponsors = Object.values(dataById)
    ?.map((val, i) => val.sponsor)
    .filter(onlyUnique)
    .filter((val) => val !== "null");
  const sponsorFilterValue = filters["sponsor"]?.value || null;

  const allPlanPortions = Object.values(dataById)
    ?.map((val, i) => val["plan_portion"])
    .filter(onlyUnique)
    .filter((val) => val !== "null");
  const planPortionFilterValue = filters["plan_portion"]?.value || null;

  let filteredData;

  //Determine which filters are active;
  const activeFilterKeys = Object.keys(filters).filter(
    (filterKey) => filterKey !== "projectId" && !!filters[filterKey].value
  );

  filteredData = Object.values(dataById).filter((val) => {
    const shouldKeep = activeFilterKeys.every((filterKey) => {
      return filters[filterKey].value === val[filterKey];
    });
    return shouldKeep;
  });

  const filteredIds = filteredData.map((d) => d.ogc_fid);

  if (!newSymbology?.source) {
    newSymbology.sources = metaData?.tiles?.sources || [];
    const source_id = newSymbology?.sources?.[0]?.id || "0";
    const source_layer = `s${source.source_id}_v${activeViewId}`;

    newSymbology.layers = ["line", "circle", "fill"].map((type) => {
      return {
        id: `source_layer_${type}`,
        ...tipRtpMapStyles[type],
        source: source_id,
        "source-layer": source_layer,
      };
    });
  }

  if (!newSymbology.images) {
    newSymbology.images = images;
  }

  if (activeFilterKeys.length) {
    newSymbology.filter = filteredIds;
  } else {
    newSymbology.filter = null;
  }

  if (projectCalculatedBounds) {
    newSymbology.fitToBounds = projectCalculatedBounds;
  }
  else{
    newSymbology.fitToBounds = null;
  }

  //Custom legend stuff
  const idToUrlColorMap = Object.values(dataById)
    .map(d => d.ptype)
    .filter(onlyUnique)
    .filter(d => d !== "null")
    .reduce((acc, ptype) => {
      const legendInfo = images.find(img => img.id === ptype.toUpperCase());
      acc[ptype.toUpperCase()] = {
        id: ptype.toUpperCase(),
        color: legendInfo?.color,
        url: legendInfo?.url
      }
      return acc
  },{});

  newSymbology.legend = {
    type: "custom",
    customLegendScale: idToUrlColorMap,
    name:
      projectKey === "rtp_id"
        ? "RTP Mappable Projects"
        : "TIP Mappable Projects",
    isActive: false,
    format: "",
    height: 6
  };

  if (!isEqual(newSymbology, tempSymbology)) {
    console.log("setting new newSymbology");
    setTempSymbology(newSymbology);
  }

  return (
    <div className="flex flex-1">
      <div className="py-3.5 px-2 text-sm text-gray-400">
        {projectKey === "rtp_id" ? "RTP" : "TIP"} ID :{" "}
      </div>
      <div className="flex-2">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={projectIdFilterValue || ""}
          onChange={(e) => setFilters({ projectId: { value: e.target.value } })}
        >
          <option className="ml-2  truncate" value={null}>
            None
          </option>
          {allProjectIds.map((v, i) => (
            <option key={i} className="ml-2  truncate" value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Project Type: </div>
      <div className="flex-1">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={projectTypeFilterValue || ""}
          onChange={(e) => setFilters({ ptype: { value: e.target.value } })}
        >
          <option className="ml-2  truncate" value={null}>
            None
          </option>
          {allProjectTypes?.map((v, i) => (
            <option key={i} className="ml-2  truncate" value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Sponsor: </div>
      <div className="flex-1">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={sponsorFilterValue || ""}
          onChange={(e) => setFilters({ sponsor: { value: e.target.value } })}
        >
          <option className="ml-2  truncate" value={null}>
            None
          </option>
          {allSponsors?.map((v, i) => (
            <option key={i} className="ml-2  truncate" value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {projectKey === "rtp_id" && (
        <>
          <div className="py-3.5 px-2 text-sm text-gray-400">
            Plan Portion:{" "}
          </div>
          <div className="flex-1">
            <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={planPortionFilterValue || ""}
              onChange={(e) =>
                setFilters({ plan_portion: { value: e.target.value } })
              }
            >
            <option className="ml-2  truncate" value={null}>
              None
            </option>
              {allPlanPortions?.map((v, i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <MapDataDownloader activeViewId={activeViewId} projectKey={projectKey} metadataColumns={metadataColumns}/>
    </div>
  );
};

const MapDataDownloader = ({ activeViewId, projectKey, metadataColumns }) => {
  const { pgEnv, falcor, falcorCache } = React.useContext(DamaContext);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const loadSourceData = async () => {
      const d = await falcor.get([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "data",
        "length",
      ]);

      let length = get(
        d,
        ["json", "dama", pgEnv, "viewsbyId", activeViewId, "data", "length"],
        0
      );

      await falcor.get([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "databyIndex",
        [...Array(length).keys()],
        metadataColumns,
      ]);
      setLoading(false);
    };
    loadSourceData();
  }, [pgEnv, activeViewId, metadataColumns]);

  const dataById = get(
    falcorCache,
    ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"],
    {}
  );

  const downloadData = React.useCallback(() => {
    const length = Object.values(dataById).length;
    const path = ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"];
    const collection = {
      type: "FeatureCollection",
      features: d3range(0, length).reduce((acc, id) => {
        const data = get(falcorCache, [...path, id], {});

        const {
          cost,
          description,
          infrastructure,
          ogc_fid,
          plan_portion,
          ptype,
          sponsor,
        } = data;
        const geom = JSON.parse(get(data, "wkb_geometry", ""));

        if (geom?.coordinates) {
          acc.push({
            type: "Feature",
            properties: {
              cost,
              description,
              infrastructure,
              ogc_fid,
              plan_portion,
              ptype,
              sponsor,
              [projectKey]: data[projectKey],
            },
            geometry: geom,
          });
        }
        return acc;
      }, []),
    };

    const options = {
      folder: "shapefiles",
      file: projectKey,
      types: {
        point: "points",
        polygon: "polygons",
        line: "lines",
      },
      outputType: "blob",
      compression: "DEFLATE",
    };
    shpwrite.download(collection, options);
  }, [falcorCache, pgEnv, activeViewId, projectKey]);

  return (
    <div>
      <Button
        themeOptions={{ size: "sm", color: "primary" }}
        onClick={downloadData}
        disabled={loading}
      >
        Download
      </Button>
    </div>
  );
};


export default ProjectMapFilter