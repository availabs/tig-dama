import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

import ckmeans from "~/pages/DataManager/utils/ckmeans";
import { getColorRange } from "~/modules/avl-components/src";

import { Combobox } from '@headlessui/react'

//import ProjectHoverComp from './MapHoverComp'

import { DamaContext } from "~/pages/DataManager/store"

export const BPMMapFilter = ({
    source,
    metaData,
    filters,
    setFilters,
    setTempSymbology,
    tempSymbology,
    activeViewId,
    layer
  }) => { 

  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext)

  let newSymbology  = cloneDeep(tempSymbology)
 
  React.useEffect(() => {
    const loadSourceData = async () => {
    
      const d = await falcor.get(['dama',pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'])
       
      let length = get(d,
        ['json', 'dama', pgEnv, 'viewsbyId' ,activeViewId, 'data', 'length'],
      0)
        const metadata =  (source?.metadata?.columns || source?.metadata || []).map(d => d.name) 
        console.log('metada', metadata)

          // console.log('length',length)
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
  },[pgEnv,activeViewId,source])



  const filteredData = React.useMemo(() => {
    // use filters to change data based on filters
    return get(falcorCache,
      ['dama', pgEnv, 'viewsbyId', activeViewId, 'databyId'],
    {})
  },[falcorCache, filters])


  React.useEffect(() => {
    //const CountyValues = Object.values(filteredData)
     // filteredData should be shaped like
    /*
      {
        '36001': 55.44,
        '36036': 57.67
        ...
      }
  
    */
    let {activeVar = 'none'} = filters
    const ckmeansLen = Math.min((Object.values(filteredData) || []).length, 5);
    const values = Object.values(filteredData || {});
    let domain = [0, 10, 25, 50, 75, 100];
    if (ckmeansLen <= values.length) {
      domain = ckmeans(values, ckmeansLen) || [];
    }
    const range = getColorRange(5, "YlOrRd", false);

    if (!(domain && domain?.length > 5)) {
      const n = domain?.length || 0;
      for (let i = n; i < 5; i++) {
        domain.push(domain[i - 1] || 0);
      }
    }

    function colorScale(domain, value) {
      let color = "rgba(0,0,0,0)";
      (domain || []).forEach((v, i) => {
        if (value >= v && value <= domain[i + 1]) {
          color = range[i];
        }
      });
      return color;
    }

    const colors = {};
    Object.keys(filteredData).forEach((geoid) => {
      colors[geoid] = colorScale(domain, filteredData[geoid]);
    });

     let output = ["get",["to-string",["get","geoid"]], ["literal", colors]]



    newSymbology = layer.layers.reduce((a, c) => {
        a[c.id] = {
          "fill-color": {
            [activeVar]: {
              type: 'threshold',
              settings: {
                range: range,
                domain: domain,
                title: 'test'
              },
              value: output
            }
          }
        };
        return a;
      }, {});


  },[filteredData])
      
  //console.log(filterData)

  // if(!newSymbology?.source) {
  //   newSymbology.sources = metaData?.tiles?.sources || []
  //   const source_id = newSymbology?.sources?.[0]?.id || '0'
  //   const source_layer = `s${source.source_id}_v${activeViewId}` 
  //   newSymbology.layers = ['line','circle','fill']
  //     .map(type => {
  //       return {
  //         id: `source_layer_${type}`,
  //         ...styles[type],
  //         source: source_id,
  //         "source-layer": source_layer
  //       }
  //     })
  //     //loadSourceData()
  // }

  // if(!newSymbology.images) {
  //   newSymbology.images = images
  // }

  if(!isEqual(newSymbology, tempSymbology)){
    console.log('setting new newSymbology')
    setTempSymbology(newSymbology)
  }


  return (
    <div>
      Hello World
      <select 
        onChange={() => console.log('changed')} 
      >

       
      </select>
    </div>
  )


}
