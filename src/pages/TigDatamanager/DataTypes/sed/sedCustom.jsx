import React, { useMemo, useEffect} from "react";
import get from "lodash/get";
import mapboxgl from "maplibre-gl";
import { useSearchParams } from "react-router-dom";
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import { DamaContext } from "~/pages/DataManager/store"
import { Button } from "~/modules/avl-components/src"
import * as d3scale from "d3-scale"
import { range as d3range } from "d3-array"
import download from "downloadjs"
// import { download as shpDownload } from "~/pages/DataManager/utils/shp-write"

import shpwrite from  '@mapbox/shp-write'

// [1112,1588,2112,2958,56390]
const defaultRange = ['#ffffb2', '#fed976',  '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026']
const defaultDomain = [0,872,2047,3649,6934,14119,28578]
export const sedVars = {
  totpop: { name: "Total Population", domain: [872,2047,3649,6934,14119,28578], range: defaultRange},
  hhpop: { name: "Households", domain: [1112,1588,2112,2958,20000, 56390], range: defaultRange},
  hhnum: { name: "Household Population", domain: [2995,4270,5680,7883,64124,177720], range: defaultRange},
  hhsize: { name: "Household Size", domain: [2.3,2.62,2.83,3.08,7], range: defaultRange},
  hhincx: { name: "Household Income", domain: [44787,61304,80355,113880,1109731], range: defaultRange},
  elf: { name: "Employed Labor Force", domain: [1351,2054,2782,3910,78160], range: defaultRange},
  emptot: { name: "Total Employment", domain: [560,1005,1699,3555,80093], range: defaultRange},
  empret: { name: "Retail Employment", domain: [30,78,167,385,13225], range: defaultRange},
  empoff: { name: "Office Employment", domain: [66,142,276,670,48061], range: defaultRange},
  earnwork: { name: "Earnings", domain: [35696,40620,45755,53519,202112], range: defaultRange},
  unvenrol: { name: "University Enrollment", domain: [670,2586,8143,51583], range: defaultRange},
  k12etot: { name: "School Enrollment", domain: [489,791,1119,1632,42294,81583], range: defaultRange},
  gqpop: { name: "Group Quarters Population", domain: [11,40,200,12050], range: defaultRange},
  gqpopins: { name: "Group Quarters Institutional Population", domain: [22,118,253,5613,12050], range: defaultRange},
  gqpopstr: { name: "Group Quarters Other Population", domain: [7,16,56,5613,10503], range: defaultRange},
  gqpopoth: { name: "Group Quarters Homeless Population", domain: [3,11,50,635,1201], range: defaultRange}
};
export const sedVarsCounty = {
    "tot_pop": {name: 'Total Population (in 000s)', domain: [79,213,481,750,1134,2801], range: defaultRange},
    "tot_emp": {name: 'Total Employment (in 000s)', domain: [31,111,243,402,624,3397], range: defaultRange},
    "emp_pay": {name: 'Payroll Employment (in 000s)', domain: [22,74,192,300,483,2997], range: defaultRange},
    "emp_prop": {name: 'Proprietors Employment (in 000s)', domain: [7,33,51,82,161,399], range: defaultRange},
    "hh_pop": {name: 'Household Population (in 000s)', domain: [69,207,473,729,1099,2761], range: defaultRange},
    "gq_pop": {name: 'Group Quarters Population (in 000s)', domain: [1,5,9,20,29,79], range: defaultRange},
    "hh_num": {name: 'Households (in 000s)', domain: [28,86,166,274,398,1044], range: defaultRange},
    "hh_size": {name: 'Household Size', domain: [1.98,2.54,2.69,2.77,2.92,3.26], range: defaultRange},
    "emplf": {name: 'Employed Labor Force (in 000s)', domain: [872,204,364,693,1411,2857], range: defaultRange},
    "lf": {name: 'Labor Force  (in 000s)', domain: [33,116,237,366,557,1383], range: defaultRange}
}
const GEOM_TYPES = {
  Point: "Point",
  MultiLineString: "MultiLineString",
  MultiPolygon: "MultiPolygon",
};
//const years = ["10", "17", "20", "25", "30", "35", "40", "45", "50", "55"];

const SedMapFilter = (props) => {
  const {
    source,
    metaData,
    filters,
    setFilters,
    setTempSymbology,
    tempSymbology,
    activeViewId,
    layer,
  } = props;
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext)
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let varType = useMemo(
    () =>
      typeof activeVar === "string"
        ? activeVar.substring(0, activeVar.length - 2)
        : "",
    [activeVar]
  );
  let year = useMemo(
    () => (typeof activeVar === "string" ? activeVar.slice(-1) : "0"),
    [activeVar]
  );

  let varList = useMemo(() => {
    return source.type === 'tig_sed_county' ? sedVarsCounty : sedVars
  },[source.type])

  const projectIdFilterValue = filters["projectId"]?.value || null;
  const dataById = get(
    falcorCache,
    ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"],
    {}
  );

  const allProjectIds = Object.keys(dataById);

  React.useEffect(() => {
    falcor.get([
      "dama",
      pgEnv,
      "viewsbyId",
      activeViewId,
      "databyId",
      allProjectIds,
      ["ogc_fid","taz","county"],
    ]);
  }, [falcor, pgEnv, activeViewId, allProjectIds]);

  const projectCalculatedBounds = useMemo(() => {
    if (projectIdFilterValue) {
      const project = Object.values(dataById).find(geo => geo.taz === parseInt(projectIdFilterValue));

      console.log("filtered to project::", project);
      const projectGeom = !!project?.wkb_geometry
        ? JSON.parse(project.wkb_geometry)
        : null;
      if (projectGeom?.type === GEOM_TYPES["Point"]) {
        const coordinates = projectGeom.coordinates;
        return new mapboxgl.LngLatBounds(coordinates, coordinates);
      } else if (projectGeom?.type === GEOM_TYPES["MultiLineString"]) {
        const coordinates = projectGeom.coordinates[0];
        return coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      } else if (projectGeom?.type === GEOM_TYPES["MultiPolygon"]) {
        const coordinates = projectGeom.coordinates[0][0];

        return coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      }
    } else {
      return undefined;
    }
  }, [projectIdFilterValue, dataById]);

  useEffect(() => {
    const updateSymbology = () => {
      falcor.get(['dama',pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'])
        .then(d => {
          let length = get(d,
            ['json', 'dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'],
          0)

          return falcor.chunk([
            'dama',
            pgEnv,
            'viewsbyId',
            activeViewId,
            'databyIndex',
            [...Array(length).keys()],
            activeVar
          ])
        }).then(() => {
            const dataById = get(falcorCache,
              ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
            {})

            const varScale = varList[varType];
            const maxScaleLength =
              varScale.domain.length > varScale.range.length
                ? varScale.range.length
                : varScale.domain.length;

            const colorDomain = varScale.domain.slice(0,maxScaleLength)
            const colorRange = varScale.range.slice(0,maxScaleLength);

            const colorScale = d3scale.scaleThreshold()
              .domain(colorDomain)
              .range(colorRange);

            let colors = Object.keys(dataById).reduce((out, id) => {
              out[+id] = colorScale(dataById[+id][activeVar]) || "#000"
              return out
            },{})
            let output = ["get",["to-string",["get","ogc_fid"]], ["literal", colors]]

            const newSymbology = layer.layers.reduce((a, c) => {
              a[c.id] = {
                "fill-color": {
                  [activeVar]: {
                    type: 'threshold',
                    settings: {
                      range: colorRange,
                      domain: colorDomain,
                      title: varScale.name
                    },
                    value: output
                  }
                },
                
              };
              return a;
            }, {});

            if (!isEqual(newSymbology, tempSymbology)) {
              console.log("setting new newSymbology");
              setTempSymbology(newSymbology);
            }
        })
    }
    if(activeVar.length > 0){
      updateSymbology()
    }
  },[activeVar, varType, year,falcorCache])

  React.useEffect(() => {
    const newSymbology = cloneDeep(tempSymbology);
    if (projectCalculatedBounds) {
      newSymbology.fitToBounds = projectCalculatedBounds;
    }
    else{
      newSymbology.fitToBounds = null;
    }

    if (!isEqual(newSymbology, tempSymbology)) {
      console.log("setting new newSymbology, projectCalculatedBounds useEffect");
      setTempSymbology(newSymbology);
    }
  },[projectCalculatedBounds])

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable")
  React.useEffect(() => {
    //console.log("SedMapFilter", activeVar);
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${ searchVar }_0` },
        });
      }
      else {
        setFilters({
          activeVar: { value: source.type === 'tig_sed_county' ? 'tot_pop_0' : "totpop_0" },
        });
      }
    }
  }, [activeVar, setFilters, searchVar]);

  //console.log('mapFilter', metaData.years, activeVar)
  const idFilterOptions = Object.values(dataById).sort((a,b) => {
    if(a.taz < b.taz){
      return -1;
    }
    else if (b.taz < a.taz){
      return 1;
    }
    else{
      if(a.county < b.county){
        return -1
      }
      else if (b.county < a.county) {
        return 1
      } 
    }
  }).map((v, i) => (
    <option key={`taz_filter_option_${i}`} className="ml-2  truncate" value={v?.taz}>
      {v.taz} -- {v.county}
    </option>
  ))

  return (
    <div className="flex flex-1 border-blue-100">
    <div className="py-3.5 px-2 text-sm text-gray-400">ID :</div>
    <div className="flex-1">
      <select
        className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
        value={projectIdFilterValue || ""}
        onChange={(e) => setFilters({ projectId: { value: e.target.value } })}
      >
        <option className="ml-2  truncate" value={""}>
          None
        </option>
        {idFilterOptions}
      </select>
    </div>
      <div className="py-3.5 px-2 text-sm text-gray-400">Year:</div>
        <div className="flex-1">
          <div className='px-6'>
          <input type="range" 
              min="0" 
              max={metaData?.years.length-1} 
              id="my-range" 
              list="my-datalist"
              className='w-full'
              value={year}
              onChange={(e) =>
              setFilters({
                activeVar: { value: `${varType}_${e.target.value}` },
              })
            }/>
          </div>
          <datalist id="my-datalist" className='w-full flex'>
            {(metaData?.years || ["2010"]).map((k, i) => (
              <option 
                key={i} 
                value={i} 
                className={`flex-1 text-gray-500 text-center text-xs`}>
              {k}
            </option>
            ))}
          </datalist>
        
        </div>

      <div className="py-3.5 ms-3 px-2 text-sm text-gray-400">Variable: </div>
      <div className="me-2">
        <select
          className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
          value={varType}
          onChange={(e) =>
            setFilters({
              activeVar: { value: `${e.target.value}_${year}` },
            })
          }
        >
          <option className="ml-2  truncate" value={null}>
            none
          </option>
          {Object.keys(varList).map((k, i) => (
            <option key={i} className="ml-2  truncate" value={k}>
              {varList[k].name}
            </option>
          ))}
        </select>
      </div>

      <MapDataDownloader
        variable={ get(varList, [varType, "name"]) }
        activeViewId={ activeViewId }
        activeVar={ activeVar }
        year={ get(metaData, ["years", year]) }/>
    </div>
  );
};

const MapDataDownloader = ({ activeViewId, activeVar, variable, year }) => {
  
  const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    if (!(pgEnv && activeViewId && activeVar)) return;
    falcor.get(['dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'])
      .then(res => {
        const length = get(res, ['json', 'dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'], 0)
        return  falcor.chunk([
          'dama',
          pgEnv,
          'viewsbyId',
          activeViewId,
          'databyId',
          d3range(0, length),
          [activeVar, "wkb_geometry", "county"]
        ]).then(() => setLoading(false))
      })
  }, [falcor, pgEnv, activeViewId, activeVar])

  const downloadData = React.useCallback(() => {
    const length = get(falcorCache, ['dama', pgEnv, 'viewsbyId', activeViewId, 'data', 'length'], 0);
    const path = ["dama", pgEnv, "viewsbyId", activeViewId, "databyId"];
    const collection = {
      type: "FeatureCollection",
      features: d3range(0, length).map(id => {
        const data = get(falcorCache, [...path, id], {});
        const value = get(data, activeVar, null);
        const county = get(data, "county", "unknown");
        const geom = JSON.parse(get(data, "wkb_geometry", "{}"));
        if(geom.type === 'Polygon') {
          geom.type = 'MultiPolygon'
          geom.coordinates = [geom.coordinates]
        }
        // console.log('geom', county,  geom.type, )
        
        return {
          type: "Feature",
          properties: {
            [variable]: value,
            county,
            year
          },
          geometry: geom
        }
      })
    }
    const options = {
      folder: `SED ${variable}`,
      file: variable,
      outputType: "blob",
      compression: "DEFLATE",
    }
    shpwrite.download(collection, options)
    //shpDownload(collection, options);
  }, [falcorCache, pgEnv, activeViewId, variable, activeVar, year]);

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

const SedTableFilter = ({ source, filters, setFilters, data, columns }) => {
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  // console.log("SedTableFilter", filters);

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  React.useEffect(() => {
    //console.log("SedMapFilter", activeVar);
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${ searchVar }` },
        });
      }
      else {
        setFilters({
          activeVar: { value: source.type === 'tig_sed_county' ? 'tot_pop' : "totpop" },
        });
      }
    }
  }, [activeVar, setFilters, searchVar]);

  let varList = useMemo(() => {
    return source.type === 'tig_sed_county' ? sedVarsCounty : sedVars
  },[source.type])

// console.log("data, columns", data, columns, varList[activeVar].name)

  const downloadData = React.useCallback(() => {
    const mapped = data.map(d => {
      return columns.map(c => {
        return d[c.accessor];
      }).join(",")
    })
    mapped.unshift(columns.map(c => c.Header).join(","));
    download(mapped.join("\n"), `${ varList[activeVar].name }.csv`, "text/csv");
  }, [data, columns, varList, activeVar]);

  //console.log(, year,activeVar)

  return (
    <div className="flex flex-1 border-blue-100">
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Variable: </div>
        <div className="px-2">
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
            {Object.keys(varList).map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {varList[k].name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ downloadData }
        >
          Download
        </Button>
      </div>
    </div>
  );
};

const SedTableTransform = (tableData, attributes, filters, years,source) => {
  let activeVar = get(filters, "activeVar.value", "totpop");

  let updatedYears = years?.map((str) => (''+str).slice(-2));
  const columns = [
    {
      Header: source.type === 'tig_sed_county' ? "County" : "TAZ",
      accessor: source.type === 'tig_sed_county' ? "county" : "taz",
      sortBy: 'asc'
    },
  ];

  updatedYears.forEach((y, i) => {
    columns.push({
      Header: `20${y}`,
      accessor: `${activeVar}_${i}`,
      Cell: ({ value }) => Math.round(value).toLocaleString(),
    });
  });

  return {
    data: tableData,
    columns,
  };
};

const SedHoverComp = ({ data, layer }) => {

  const { pgEnv, falcor, falcorCache } = React.useContext(DamaContext);
  const { source: { type }, attributes, activeViewId, props: { filters, activeView: {metadata: { years } } }  } = layer

  const id = React.useMemo(() => get(data, '[0]', null), [data])
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);

  let getAttributes = (typeof attributes?.[0] === 'string' ?
    attributes : attributes.map(d => d.name)).filter(d => !['wkb_geometry'].includes(d))

  //console.log('hover attributes', getAttributes)

  React.useEffect(() => {
    falcor.get([
      'dama',
      pgEnv,
      'viewsbyId',
      activeViewId,
      'databyId',
      id,
      getAttributes
    ])
  }, [falcor, pgEnv, activeViewId, id, attributes])


  const attrInfo = React.useMemo(() => {
    return get(falcorCache, [
        'dama',
        pgEnv,
        'viewsbyId',
        activeViewId,
        'databyId',
        id
      ], {});
  }, [id, falcorCache, activeViewId, pgEnv]);



  let year = years[activeVar.split('_').slice(-1) || 0]

  let varName = type === 'tig_sed_taz' ?
    sedVars[activeVar.split('_')[0] || 'tot_pop']?.name || '' :
    sedVarsCounty[activeVar.slice(0,-2) || 'totpop']?.name || ''

  return (
    <div className='bg-white p-4 max-h-64 scrollbar-xs overflow-y-scroll'>
     {varName} {year}
      <div className='font-medium pb-1 w-full border-b '>{layer.source.display_name}</div>
          { type === 'tig_sed_taz' ?
            <div className='flex border-b pt-1' >
            <div className='flex-1 font-medium text-sm pl-1'>TAZ</div>
            <div className='flex-1 text-right font-thin pl-4 pr-1'>{attrInfo?.['taz']}</div>
          </div> : ''}
          <div className='flex border-b pt-1' >
            <div className='flex-1 font-medium text-sm pl-1'>County</div>
            <div className='flex-1 text-right font-thin pl-4 pr-1'>{attrInfo?.['county']}</div>
          </div>
          <div className='flex border-b pt-1' >
            <div className='flex-1 font-medium text-sm pl-1'>Value</div>
            <div className='flex-1 text-right font-thin pl-4 pr-1'>{get(attrInfo, activeVar,'').toLocaleString()}</div>
          </div>

    </div>
  )
}

export { SedMapFilter, SedTableFilter, SedTableTransform, SedHoverComp };
