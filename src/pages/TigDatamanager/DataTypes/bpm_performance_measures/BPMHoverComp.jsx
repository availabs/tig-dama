import React, { useMemo } from "react";
import get from "lodash/get";
import { fips2Name, } from "../constants";
import { DamaContext } from "~/pages/DataManager/store"
import { variableAccessors, variableLabels, dataVariableNames } from './BPMConstants';



export const BPMHoverComp = (props) => {
    const { data: importData, layer, source } = props
console.log("bpm hover comp, props", props)
    const { pgEnv, falcor, falcorCache } = React.useContext(DamaContext);
    const { source: { type }, attributes, activeViewId, props: { filters, activeView: {metadata: { years } } }  } = layer
  
    const {geoid} = importData[2];

    const countyName = fips2Name[geoid];
    console.log("geoid", geoid, "countyName", countyName);

    const timePeriod = filters['period']?.value || null;
    const functionalClass = filters['functional_class']?.value || null;


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
    
    const mapData = Object.values(React.useMemo(() => {
        return get(falcorCache,
          ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
        {})
    },[falcorCache, filters]));  
  
    console.log("mapData",mapData)

    const filterKeys = Object.keys(filters);
  

  
    let data = mapData;
    filterKeys.filter(filterName => filterName !== "activeVar").forEach((key, i) => {
      data = data.reduce((acc, val) => {
        if(filters[key].value == val[key]) {
            acc.push(val);
        } 
        return acc;
      }, []);
    });

    let sumAll = {};
    data.reduce((i, data) => {
      if(data?.functional_class != "total")
      sumAll[data?.area] = {
        total_vehicle_miles_traveled: Number(data.vehicle_miles_traveled) + sumAll[data.area]?.total_vehicle_miles_traveled || 0,
        total_vehicle_hours_traveled: Number(data.vehicle_hours_traveled) + sumAll[data.area]?.total_vehicle_hours_traveled || 0,
        total_speed: data.ave_speed + sumAll[data.area]?.total_speed || 0,
        count: 1+sumAll[data?.area]?.count || 0
      }

    }, {});
  
    Object.keys(sumAll).reduce((i, key) => {
      sumAll[key].ave_speed = sumAll[key].total_speed/sumAll[key].count;
    }, []);

    console.log('what is the value of the data: ', data);
    console.log("what is the values of sumAll: ", sumAll);


    // const finalchartData = mapData.reduce((out,d) =>  {
    //     let regions = [d.area]
    //     //Filter out for time and class 
    //     if(d.period === timePeriod && d.functional_class === functionalClass){
    //         regions.forEach((region) => {
    //             //Initialize Object
    //             if(!out[region]) {
    //                 out[region] = {
    //                     id:  region,
    //                     name: region,
    //                 }
    //                 dataVariableNames.forEach(varName => {
    //                     if(varName === 'ave_speed'){
    //                         out[region][varName] = {value: 0, count:0};
    //                     }
    //                     else {
    //                         out[region][varName] = 0;
    //                     }

    //                 })
    //             }
    //             //Assign/sum values
    //             dataVariableNames.forEach(varName => {
    //                 const accessor = variableAccessors[varName];
    //                 if(varName === 'ave_speed'){
    //                     out[region][varName].count++;
    //                     out[region][varName].value += +d[accessor];
    //                 }
    //                 else{
    //                     out[region][varName] +=  +d[accessor];
    //                 }

    //             })
    //         })
    //     }

    //     return out
    // },{});
    //console.log(finalchartData)

    //Otherwise, we get popups for counties that we don't have data for

    const renderData = data.find(county => county.area === countyName);
    const shouldDisplay = renderData && dataVariableNames.every(dataVarName => renderData?.[variableAccessors[dataVarName]] !== undefined);
    return (
        shouldDisplay && 
      <div className='bg-white p-4 max-h-64 scrollbar-xs overflow-y-scroll'>
                      <div className='flex-1 text-center font-bold pl-4 pr-1'>{countyName} County</div>

        <div className='font-medium pb-1 w-full border-b '>{layer.source.display_name}</div>

            {
                dataVariableNames.map(dataVarName => (
                    <div className='flex border-b pt-1' >
                    <div className='flex-1 font-medium text-sm pl-1'>{variableLabels[dataVarName]}</div>
                    <div className='flex-1 text-right font-thin pl-4 pr-1'>{dataVarName === 'AvgSpeed' ? (renderData?.[variableAccessors[dataVarName]]).toFixed(2).toLocaleString() :Math.round(renderData?.[variableAccessors[dataVarName]])?.toLocaleString()}</div>
                  </div>
                ))

            }

  
      </div>
    )
  }