import React, { useMemo, useEffect } from "react";
import { get, sum, mean } from "lodash";
import { useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import download from "downloadjs";

import { Button } from "~/modules/avl-components/src";
import { fips2Name, regionalData } from "../constants";
import { DamaContext } from "~/pages/DataManager/store"

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
};

const areas = [
  ...Object.keys(regionalData?.regions || {}),
  ...Object.keys(regionalData?.sub_regions || {}),
];

export const BPMChartFilters = ({
  filters,
  source,
  setFilters,
  variables,
  years,
  node,
  activeViewId
}) => {

  const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let area = filters['area']?.value || null;// useMemo(() => get(filters, "area.value", ""), [filters]);
  let summarize = filters['summarize']?.value || null; //useMemo(() => get(filters, "summarize.value", ""), [filters]);
  const timePeriod = filters['period']?.value || null;
  const functionalClass = filters['functional_class']?.value || null;

  console.log('filters', activeVar, area,summarize, timePeriod,functionalClass)

  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  React.useEffect(() => {
    const loadSourceData = async () => {
    
      const d = await falcor.get(['dama',pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length']);
      let length = get(d,
        ['json', 'dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'],
      0)
      const metadata =  (source?.metadata?.columns || source?.metadata || []).map(d => d.name);

      await falcor.get([
        'dama',
        pgEnv,
        'viewsbyId',
        activeViewId,
        'databyIndex',
        [...Array(length).keys()],
        metadata
      ])
    
    }
    loadSourceData()
  },[pgEnv,activeViewId,source]);

  const data = Object.values(React.useMemo(() => {
    return get(falcorCache,
      ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
    {})
  },[falcorCache, filters]))

  const allTimePeriods = data?.map((val, i) => val.period).filter(onlyUnique);
  const allFunctionalClasses = data?.map((val, i) => val.functional_class).filter(onlyUnique);
  const variableClasses = ["VMT", "VHT", "AvgSpeed"];

  useEffect(() => {
    const update = {};
    if(!timePeriod) {
      update.period = { value: 'all_day'};
    }
    if(!functionalClass) {
      update.functional_class = { value: 'total'};
    }
    if(!activeVar){
      update.activeVar = { value: 'VMT'};
    }
    if (!area) {
      update.area = { value: "all" };
    }
    if (!summarize) {
      update.summarize = { value: "region" };
    }
    console.log('update', update)
    setFilters(update);
  }, []);
 

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  

  // React.useEffect(() => {
  //   const update = {};
  //   if (!get(filters, "summarize.value", null)) {
  //     update.summarize = { value: "county" };
  //   }
  //   if (!get(filters, "year.value", null)) {
  //     update.year = { value: "2019" };
  //   }

  //   setFilters(update);
  // }, [variables]);

  const downloadImage = React.useCallback(() => {
    console.log("Called");
    if (!node) return;
    toPng(node, { backgroundColor: "#fff" }).then((dataUrl) => {
      download(dataUrl, `${activeVar}.png`, "image/png");
    });
  }, [node, activeVar]);

  return (
    <div className="flex flex-1 border-blue-100">
      {/*<div className="py-3.5 px-2 text-sm text-gray-400">Area: </div>
      <div className="flex-1" style={{ width: "min-content" }}>
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
      </div>*/}
      <div className="py-3.5 px-2 text-sm text-gray-400">Summarize: </div>
      <div className="flex-1">
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
      <div className='py-3.5 px-2 text-sm text-gray-400'>Variable : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={activeVar || ''}
              onChange={(e) => setFilters({'activeVar' :{ value: e.target.value}})}
            >
              {variableClasses?.filter(d => d).map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Time period : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={timePeriod || ''}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='py-3.5 px-2 text-sm text-gray-400'>Functional class : </div>
        <div className='flex-1'>
          <select
              className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
              value={functionalClass || ''}
              onChange={(e) => setFilters({'functional_class' :{ value: e.target.value}})}
            >
              {allFunctionalClasses?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
          </select>
        </div>
        <div className='px-4'>
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

export const BPMChartTransform = ({ valueMap, filters }) => {
  
  const filterKeys = Object.keys(filters);
  
 console.log('valueMap', filters, valueMap)
  let data = valueMap.filter(d => {
    return d['functional_class'] == filters['functional_class']?.value  && 
    d['period'] == filters['period']?.value
  })

  console.log('filtered data', data)
  // filterKeys.forEach((key, i) => {
  //   data = data.reduce((acc, val) => {
  //     if(filters[key].value == val[key]) {
  //         acc.push(val);
  //     } 
  //     return acc;
  //   }, []);
  // });

  

  let summarize = get(filters, "summarize.value", "county");
  let area = get(filters, "area.value", "all");
  console.log('chart Transform', data)

  const areaToGeos = getAreaToGeos(regionalData, fips2Name);

  let finalchartData = [];
  let keys = [];
  const variableAccessors = {
    "VMT" : "vehicle_miles_traveled",
    "VHT" : "vehicle_hours_traveled",
    "AvgSpeed": "ave_speed"
  };
  const accessor = variableAccessors?.[filters?.activeVar?.value] || 'vehicle_miles_traveled'


  const getRegions = (summarize, county) => {
    //console.log('what is my key', summarize)
    if(summarize === 'county') {
      return [county]
    }
    if(summarize === 'region') {
      return Object.keys(regionalData.regions).reduce((out,reg) => {
        if(regionalData.regions[reg].includes(county)){
          out.push(reg)
        }
        return out
      },[])
    }
    if(summarize === 'subRegion') {
      return Object.keys(regionalData.sub_regions).reduce((out,reg) => {
        if(regionalData.sub_regions[reg].includes(county)){
          out.push(reg)
        }
        return out
      },[])
    }
  }

    console.log('access', filters, variableAccessors?.[filters?.activeVar?.value])
    finalchartData = Object.values(data.reduce((out,d) =>  {
      let regions = getRegions(filters?.summarize?.value || 'region', d.area)
      //console.log('region', region, d.area)
      regions.forEach((region) => {
         if(!out[region]) { 
          out[region] = {
            id:  region,
            name: region,
            value: 0
          }
        }
        out[region].value +=  Math.round(+d[accessor] || 0)
      })
      return out
    },{}))
    .sort((a,b) => a.value - b.value);

  //console.log('finalchartData', finalchartData)
  return {
    data: finalchartData,
  };
};
