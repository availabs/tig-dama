import React, { useMemo, useEffect } from 'react'
import { DamaContext } from "~/pages/DataManager/store"
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import mapboxgl from "maplibre-gl";
import { Button } from "~/modules/avl-components/src";
// const ptypes_colors= {
//   "Study": "#004C73",
//   "Highway": "#A80000",
//   "Bridge": "#A80000",
//   "Ferry": "#D79E9E",
//   "Transit": "#C19A6B",
//   "Rail": "#9C9C9C",
//   "Stations": "#9C9C9C",
//   "Truck": "#149ECE",
//   "Pedestrian": "#70A800",
//   "Bike": "#267300",
//   "Bus": "#C19A6B",
//   "ITS": "#FC921F",
//   "Parking":  "Parking",
//   "Freight":  "#149ECE",
// }

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
  {
    id: "PEDESTRIAN",
    url: "/mapIcons/pedestrian.png",
    color: "#B1FF00",
    type: "both",
  },
  { id: "ITS", url: "/mapIcons/its.png", color: "#FF00C5", type: "both" },
  {
    id: "PARKING",
    url: "/mapIcons/parking.png",
    color: "#496bff",
    type: "both",
  },
  { id: "FREIGHT", url: "/mapIcons/truck.png", color: "#fff", type: "both" },
  { id: "TRANSIT", url: "/mapIcons/transit.png", color: "#fff", type: "both" },
  { id: "HISTORIC", url: "", color: "#ffeb3b", type: "both" },
  { id: "STUDY", url: "", color: "#FFAA00", type: "both" },
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

  let projectKey = source?.name.includes("RTP") ? "rtp_id" : "tip_id";
  let newSymbology = cloneDeep(tempSymbology);

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
      const metadata = (
        source?.metadata?.columns ||
        source?.metadata ||
        []
      ).map((d) => d.name);

      await falcor.get([
        "dama",
        pgEnv,
        "viewsbyId",
        activeViewId,
        "databyIndex",
        [...Array(length).keys()],
        metadata,
      ]);
    };
    loadSourceData();
  }, [pgEnv, activeViewId, source]);

  const dataById = get(
    falcorCache,
    ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"],
    {}
  );

  // const geomtypes = Object.values(dataById)
  //   .map((d) => JSON.parse(d?.wkb_geometry)?.type)
  //   .filter(onlyUnique);
  // console.log("geomtypes", geomtypes);

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

  const allProjectIds = dataIds[projectKey];
  const projectIdFilterValue = filters["projectId"]?.value || null;

  let projectCalculatedBounds;
  if (projectIdFilterValue) {
    const project = Object.values(dataById).find(
      (d) => d[projectKey] === projectIdFilterValue
    );
    const projectGeom = JSON.parse(project.wkb_geometry);
    if (projectGeom.type === GEOM_TYPES["Point"]) {
      const coordinates = projectGeom.coordinates;
      projectCalculatedBounds = new mapboxgl.LngLatBounds(
        coordinates,
        coordinates
      );
    } else if (projectGeom.type === GEOM_TYPES["MultiLineString"]) {
      const coordinates = projectGeom.coordinates[0];
      projectCalculatedBounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    } else if (projectGeom.type === GEOM_TYPES["MultiPolygon"]) {
      //ryan todo -- can't tell if this is always [0][0], or if we need to nested-reduce these bounds
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
  allProjectTypes.unshift("");
  const projectTypeFilterValue = filters["ptype"]?.value || null;

  const allSponsors = Object.values(dataById)
    ?.map((val, i) => val.sponsor)
    .filter(onlyUnique)
    .filter((val) => val !== "null");
  allSponsors.unshift("");
  const sponsorFilterValue = filters["sponsor"]?.value || null;

  const allPlanPortions = Object.values(dataById)
    ?.map((val, i) => val["plan_portion"])
    .filter(onlyUnique)
    .filter((val) => val !== "null");
  allPlanPortions.unshift("");
  const planPortionFilterValue = filters["plan_portion"]?.value || null;

  //Initialize filters
  useEffect(() => {
    const updateFilter = {};

    if (!projectIdFilterValue) {
      updateFilter.projectId = { value: "" };
    }
    if (!projectTypeFilterValue) {
      updateFilter.ptype = { value: "" };
    }
    if (!sponsorFilterValue) {
      updateFilter.sponsor = { value: "" };
    }
    if (!planPortionFilterValue) {
      updateFilter["plan_portion"] = { value: "" };
    }

    setFilters(updateFilter);
  }, []);

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

  //Custom legend stuff
  const totalDomain = images
    .concat(
      Object.keys(ptypes_colors).map((ptype) => ({
        id: ptype,
        color: ptypes_colors[ptype],
      }))
    )
    .filter(
      (domainElement) => domainElement.id !== "" && domainElement.id !== "NULL"
    );
  const idToUrlColorMap = {};

  totalDomain.forEach((domainElement) => {
    const { id, type } = domainElement;
    if (!idToUrlColorMap[id]) {
      idToUrlColorMap[id] = {
        id,
        type,
      };
    }
    if (domainElement["color"]) {
      idToUrlColorMap[id]["color"] = domainElement.color;
    }
    if (domainElement["url"]) {
      idToUrlColorMap[id]["url"] = domainElement.url;
    }
  });

  newSymbology.legend = {
    height: 8,
    type: "custom",
    customLegendScale: idToUrlColorMap,
    name:
      projectKey === "rtp_id"
        ? "RTP Mappable Projects"
        : "TIP Mappable Projects",
    isActive: false,
    format: "",
    height: 12,
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
              {allPlanPortions?.map((v, i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

const MapDataDownloader = ({ activeViewId, year }) => {

const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    
    const loadData = async () => {
      await falcor.chunk([
        'dama',
        pgEnv,
        'viewsbyId',
        activeViewId,
        'databyIndex',
        [...Array(length).keys()],
        ['ogc_fid',projectKey,'mpo', 'sponsor', 'ptype', 'wkb_geometry']
      ]);
    }

    loadData();

    setLoading(true);

    if (!(pgEnv && activeViewId)) return;
  }, [falcor, pgEnv, activeViewId]);

  const data = get(falcorCache,
    ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
  {})


  const downloadData = React.useCallback(() => {
    // const length = get(falcorCache, ['dama', pgEnv, 'viewsbyId', activeViewId, 'data', 'length'], 0);
    // const path = ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"];
    // const collection = {
    //   type: "FeatureCollection",
    //   features: d3range(0, length).map(id => {
    //     const data = get(falcorCache, [...path, id], {});
    //     console.log("what is the value of data: ", data);
    //     const value = get(data, null);
    //     const county = get(data, "county", "unknown");
    //     const geom = get(data, "wkb_geometry", "");
    //     console.log('geom', geom, data)
    //     return {
    //       type: "Feature",
    //       properties: {
    //         [variable]: value,
    //         county,
    //         year
    //       },
    //       geometry: JSON.parse(geom)
    //     }
    //   })
    // }
    // const options = {
    //   folder: "shapefiles",
    //   file: variable,
    //   types: {
    //     point: 'points',
    //     polygon: 'polygons',
    //     line: 'lines'
    //   }
    // }
    // shpDownload(collection, options);
  }, [falcorCache, pgEnv, activeViewId, year]);

  return (
    <div>
      <Button themeOptions={{size:'sm', color: 'primary'}}
        onClick={ downloadData }
        disabled={ loading }
      >
        Download
      </Button>
    </div>
  )
}


export default ProjectMapFilter