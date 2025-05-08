import React from "react";
import {  Link  } from "react-router-dom";
import { dmsDataTypes } from "~/modules/dms/src"
import { makeLexicalFormat } from "~/pages/DataManager/DataTypes/default/Overview";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";



const Overview = ({ searchParams, setSearchParams, source, views, activeViewId, getVariables, filterButtons=[], userHighestAuth }) => {
  const [variables,setVariables] = React.useState([])

  const activeVariable = React.useMemo(() => {
    return searchParams.get("variable") || variables[0]?.key;
  }, [searchParams, variables]);
  React.useEffect(() => {
    async function fetch () {
      let vars = await getVariables(source,views,activeViewId)
      setVariables(vars)
    }
    fetch()
  },[source, views, activeViewId, getVariables])

  const buttons = [
    {name: 'Map', icon: 'fad fa-location-dot', to: `/source/${source.source_id}/map`},
    {name: 'Table', icon: 'fad fa-table', to: `/source/${source.source_id}/table`},
    {name: 'Chart', icon: 'fad fa-bar-chart', to: `/source/${source.source_id}/chart`},
    {name: 'Watch', icon: 'fad fa-eye', authLevel: SOURCE_AUTH_CONFIG['VIEW'], to: `/source/${source.source_id}`},
    {name: 'Edit Metadata', icon: 'fad fa-wrench', authLevel: SOURCE_AUTH_CONFIG['EDIT'], to: `/source/${source.source_id}/meta`},
    {name: 'View Metadata', icon: 'fad fa-info-circle', to: `/source/${source.source_id}/meta`},
    {name: 'Access Controls', icon: 'fad fa-gears',  authLevel: SOURCE_AUTH_CONFIG['ADMIN'], to: `/source/${source.source_id}/admin`},  
    {name: 'Delete', icon: 'fad fa-trash',  authLevel: SOURCE_AUTH_CONFIG['ADMIN'], to: `/delete/source/${source.source_id}`} 
  ];
  const Lexical = dmsDataTypes.lexical.ViewComp;
  const descValue = source.description // makeLexicalFormat(source.description);
  console.log("source::", source)
  return (
    <div className='flex md:flex-row flex-col '>
      <div className="w-full md:w-[600px] border-b-2 border-tigGreen-100 pb-4" >
        <div className="border-b border-gray-800 p-4 text-sm">
          {
            source.description ? <Lexical value={makeLexicalFormat(descValue)}/> :
                <div className={'min-h-10'}>No Description</div>
          }</div>
        <div className='pl-2 text-lg font-semibold'>{source.name}</div>
        { variables.map(({ key, name }) => (
            <Variable 
              key={ key }
              variable={ key } name={ name }
              isActive={ activeVariable === ''+key }
              setSearchParams={ setSearchParams }/>
          ))
        }
      </div>
      <div className='flex-1' />
      <div className='w-full md:w-[300px]'>
        <div className='text-sm font-medium pl-2'>Actions for:</div>
        <div className='text-sm font-thin pl-2'>{variables.filter(d => ''+d.key == activeVariable)?.[0]?.name || ''}</div>
        {
          buttons
            .filter(b => !filterButtons.includes(b.name))
            .filter(b => {
              return !b.authLevel || userHighestAuth >= b.authLevel
            })
            .map(b => {
            return (
              <Link 
                to={`${b.to}${activeVariable ? `?variable=${activeVariable}` : ''}`} 
                className='w-full mx-2 font-light hover:font-medium rounded text-gray-700 bg-tigGreen-50 hover:bg-tigGreen-100 px-5 py-1 block text-center my-2 '>
                <div><i className={`${b.icon} px-2`}/>{b.name}</div>
              </Link>
            )
          })

        }

      </div>
    </div>
  )
}
export default Overview

const Variable = ({ name, variable, type, isActive, setSearchParams }) => {
  const onClick = React.useCallback(() => {

    setSearchParams(`variable=${ variable }`);
  }, [setSearchParams, variable]);
  return (
    <div onClick={ onClick }
      className={ `
        px-4 py-0.5 font-light rounded hover:bg-gray-100 cursor-pointer text-sm
        ${ isActive ? "bg-tigGreen-50 hover:bg-tigGreen-50" : "" }
      ` }
    >
      { name }
    </div>
  )
}
