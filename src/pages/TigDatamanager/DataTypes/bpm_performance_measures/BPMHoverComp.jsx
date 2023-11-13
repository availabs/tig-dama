import React from "react";
import get from "lodash/get";
import { fips2Name, } from "../constants";
import { DamaContext } from "~/pages/DataManager/store"
import { BPM_DISPLAY_DIVISOR, variableLabels, dataVariableNames, variableAccessors } from './BPMConstants';



export const BPMHoverComp = (props) => {
    const { data: importData, layer, source } = props

    const { pgEnv, falcor, falcorCache } = React.useContext(DamaContext);
    const { activeViewId, props: { filters }  } = layer
  
    const {geoid} = importData[2];
    const countyName = fips2Name[geoid];

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
  
    const filterKeys = Object.keys(filters);

    let filteredData = mapData;
    filterKeys.forEach((key, i) => {
        if(key !== 'activeVar') {
          filteredData = filteredData.reduce((acc, val) => {
            if(filters[key].value == val[key]) {
                acc.push(val);
            } 
            return acc;
          }, []);
        }
      });

    const sumAll = filteredData.reduce((sumAll, d) => {
        if(!sumAll[d?.area]){
          sumAll[d?.area] = {
            ogc_fid: d.ogc_fid,
            VMT: 0,
            VHT: 0,
            total_speed: 0,
            count: 0
          }
        }
    
        sumAll[d?.area] = {
          VMT: Number(d?.[variableAccessors['VMT']]) + sumAll[d?.area].VMT || 0,
          VHT: Number(d?.[variableAccessors['VHT']]) + sumAll[d?.area].VHT || 0,
          total_speed: d?.ave_speed + sumAll[d?.area].total_speed || 0,
          count: 1+sumAll[d?.area]?.count || 0
        }
        return sumAll
    }, {});
    

    const formattedData = {};

    Object.keys(sumAll).forEach(area => {
        const countyData = sumAll[area];

        formattedData[area] = {
            ...countyData,
            area,
            AvgSpeed: countyData.total_speed / countyData.count,
        }
    })
        

    const renderData = formattedData[countyName];
    //Otherwise, we get popups for counties that we don't have data for
    const shouldDisplay = renderData && dataVariableNames.every(dataVarName => renderData?.[dataVarName] !== undefined);

    return (
        shouldDisplay && 
      <div className='bg-white p-4 max-h-64 scrollbar-xs overflow-y-scroll'>
            <div className='flex-1 text-center font-bold pl-4 pr-1'>{countyName} County</div>
            <div className='font-medium pb-1 w-full border-b '>{layer.source.display_name}</div>
            {
                dataVariableNames.map(dataVarName => (
                    <div className='flex border-b pt-1' key={`${countyName}_${dataVarName}`}>
                        <div className='flex-1 font-medium text-sm pl-1'>{variableLabels[dataVarName]}</div>
                        <div className='flex-1 text-right font-thin pl-4 pr-1'>{dataVarName === 'AvgSpeed' ? (renderData?.[dataVarName]).toFixed(2).toLocaleString() : Math.round(renderData?.[dataVarName] / BPM_DISPLAY_DIVISOR )?.toLocaleString()}</div>
                    </div>
                ))

            }

  
      </div>
    )
}
