import React, { useMemo, useEffect } from "react";
import { get, sum, mean } from "lodash";
import { useSearchParams } from "react-router-dom";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";
import { Button } from "~/modules/avl-components/src";
import { fips2Name, regionalData } from "../constants";
import { variableAccessors } from './BPMConstants'
import { DamaContext } from "~/pages/DataManager/store"
import { FilterControlContainer } from "../controls/FilterControlContainer";

const summarizeVars = {
  subRegion: { name: "Sub Region" },
  region: { name: "Region" },
};

//TODO remove `NYBPM Counties` from regional dropdown? 
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
  activeViewId,
  userHighestAuth
}) => {

  const { pgEnv, falcor, falcorCache  } = React.useContext(DamaContext);

  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  let area = filters['area']?.value || null;// useMemo(() => get(filters, "area.value", ""), [filters]);
  let aggFunc = get(filters, "aggregate.value", null);
  let summarize = filters['summarize']?.value || null; //useMemo(() => get(filters, "summarize.value", ""), [filters]);
  const timePeriod = filters['period']?.value || null;
  const functionalClass = filters['functional_class']?.value || null;

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
    if (!aggFunc) {
      update.aggregate = { value: "sum" };
    }
    if (!area) {
      update.area = { value: "all" };
    }
    if (!summarize) {
      update.summarize = { value: "county" };
    }
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
    <div className="flex w-full p-1">
      <div className="flex flex-wrap">
        <FilterControlContainer 
          header={"Area: "}
          input={({className}) => (<select
            className={className}
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
          </select>)}
        />
        <FilterControlContainer 
          header={"Summarize: "}
          input={({className}) => (<select
            className={className}
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
          </select>)}
        />
        <FilterControlContainer 
          header={'Variable:'}
          input={({className}) => (
            <select
              className={className}
              value={activeVar || ''}
              onChange={(e) => setFilters({'activeVar' :{ value: e.target.value}})}
            >
              {variableClasses?.filter(d => d).map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        />
        {summarize !== "county" && activeVar !== 'AvgSpeed' && 
          <FilterControlContainer 
            header={"Aggregation: "}
            input={({className}) => (<select
              className={className}
              value={aggFunc}
              onChange={(e) =>
                setFilters({ ...filters, aggregate: { value: e.target.value } })
              }
            >
              <option className="ml-2  truncate" value={"sum"}>
                Sum
              </option>
              <option className="ml-2  truncate" value={"avg"}>
                Average
              </option>
            </select>)}
          />
        }
        <FilterControlContainer 
          header={'Time period:'}
          input={({className}) => (
            <select
              className={className}
              value={timePeriod || ''}
              onChange={(e) => setFilters({'period' :{ value: e.target.value}})}
            >
              {allTimePeriods?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v?.replace("_"," ")}
                </option>
              ))}
            </select>
          )}
        />
        <FilterControlContainer 
          header={'Functional class:'}
          input={({className}) => (
            <select
              className={className}
              value={functionalClass || ''}
              onChange={(e) => setFilters({'functional_class' :{ value: e.target.value}})}
            >
              {allFunctionalClasses?.filter(d => d && d !== 'null').map((v,i) => (
                <option key={i} className="ml-2  truncate" value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        />
      </div>
      {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="ml-auto mt-5 mr-1">
        <Button
          themeOptions={{ size: "sm", color: "primary" }}
          onClick={downloadImage}
        >
          Download
        </Button>
      </div>}
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


const getSelectedArea = (area, groupByTableData) => {
  let selectedGroupByTableData = {};
  if (regionalData?.regions?.hasOwnProperty(area)) {
    regionalData?.regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData.find(datum => datum.id === key);
    });
  } else if (regionalData?.sub_regions?.hasOwnProperty(area)) {
    regionalData?.sub_regions[area]?.forEach((key) => {
      selectedGroupByTableData[key] = groupByTableData.find(datum => datum.id === key);
    });
  }
  
  return Object.values(selectedGroupByTableData);
};

export const BPMChartTransform = ({ valueMap, filters }) => {
  
  const filterKeys = Object.keys(filters);
  
  let data = valueMap.filter(d => {
    return d['functional_class'] == filters['functional_class']?.value  && 
    d['period'] == filters['period']?.value
  })
  
  let aggFunc =  get(filters, "aggregate.value", "sum");
  let summarize = get(filters, "summarize.value", "county");
  let area = get(filters, "area.value", "all");

  const areaToGeos = getAreaToGeos(regionalData, fips2Name);

  let finalchartData = [];
  let keys = [];

  const accessor = variableAccessors?.[filters?.activeVar?.value] || 'vehicle_miles_traveled'

  const getRegions = (summarize, county) => {
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
  const activeVar = get(filters, "activeVar.value");

  finalchartData = Object.values(data.reduce((out,d) =>  {
    let regions = getRegions(summarize, d.area)
    regions.forEach((region) => {
        if(!out[region]) { 
        out[region] = {
          id:  region,
          name: region,
          value: 0,
          count: 0,
          variable: activeVar
        }
      }
      out[region].value +=  Math.round(+d[accessor] || 0)
      out[region].count++;
    })
    return out
  },{}))

  if (area !== "all") {
    finalchartData = getSelectedArea(area, finalchartData);
  }
  
  if(aggFunc === "avg" || activeVar === 'AvgSpeed'){
    finalchartData.forEach(bar => {
      bar.value = bar.value / bar.count
    })
  }

  finalchartData.sort((a,b) => a.value - b.value);

  return {
    data: finalchartData,
  };
};
