import React, { useEffect, useMemo } from 'react'
import get from 'lodash/get'
import { FilterControlContainer } from '../../controls/FilterControlContainer'
import { DamaContext } from "~/pages/DataManager/store";
import {
  ViewAttributes,
  getAttributes,
} from "~/pages/DataManager/Source/attributes";

const buttonStates = {
    AWAITING: {
      text: 'Publish',
      color: 'bg-blue-500'
    },
    IN_PROGRESS: {
      text: "Publishing...",
      color: "bg-amber-500"
    },
    PUBLISHED: {
       text: "Publishing...",
       color: "bg-amber-500"
    },
    ERROR : {
       text: "Error...",
       color: "bg-red-500"
    }
}

export default function PublishButton({ state, dispatch }) {
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  const {
    layerName,
    publishStatus,
    uploadErrMsg,
    lyrAnlysErrMsg,
    tableDescriptor,
    damaSourceName,
    damaSourceId,
    damaServerPath,
    etlContextId,
    gisUploadId,
    userId,
    customViewAttributes,
    sourceType,
    mbtilesOptions,
    existingHubboundSourceId,
    existingHubboundViewId
  } = state

  const { 
    text: publishButtonText, 
    color: publishButtonBgColor } = useMemo(()=> 
      get(buttonStates, publishStatus, buttonStates['AWAITING'])
  , [publishStatus]);

  const hubboundSourcesPath = [
    "dama",
    pgEnv,
    "sources",
    "byCategory",
    "Hub Bound"
  ]
  useEffect(() => {
    falcor.get(hubboundSourcesPath);
  }, [hubboundSourcesPath, falcor])

  const existingHubboundSources = useMemo(() => {
    return get(falcorCache, hubboundSourcesPath, {})?.value
  },[falcorCache])

  useEffect(() => {
    async function getData() {
      const lengthPath = [
        "dama",
        pgEnv,
        "sources",
        "byId",
        existingHubboundSourceId,
        "views",
        "length",
      ];

      const resp = await falcor.get(lengthPath);
      await falcor.get([
        "dama",
        pgEnv,
        "sources",
        "byId",
        existingHubboundSourceId,
        "views",
        "byIndex",
        {
          from: 0,
          to: get(resp.json, lengthPath, 0) - 1,
        },
        "attributes",
        Object.values(ViewAttributes),
      ]);
    }
    if(existingHubboundSourceId) {
      getData();
    }
  }, [existingHubboundSourceId])


  const views = useMemo(() => {
    return Object.values(
      get(
        falcorCache,
        ["dama", pgEnv, "sources", "byId", existingHubboundSourceId, "views", "byIndex"],
        {}
      )
    ).map((v) =>
      getAttributes(get(falcorCache, v.value, { attributes: {} })["attributes"])
    );
  }, [falcorCache, existingHubboundSourceId, pgEnv]);
  if (!gisUploadId || uploadErrMsg || lyrAnlysErrMsg) {
    return "";
  }

  const publish = () => {
    const runPublish = async () => { 
      try {
        dispatch({type: 'update', payload: { publishStatus : 'IN_PROGRESS' }})

        if (mbtilesOptions && mbtilesOptions?.preserveColumns && (Object.keys(mbtilesOptions?.preserveColumns || {}) || []).length) {
          mbtilesOptions.preserveColumns = (Object.keys(mbtilesOptions?.preserveColumns || {}) || []).filter(key => mbtilesOptions?.preserveColumns[key] === true);
        } else {
          mbtilesOptions.preserveColumns = [];
        }

        const publishData = {
          source_id: damaSourceId || existingHubboundSourceId || null,
          view_id: existingHubboundViewId || null,
          source_values: {
            name: damaSourceName,
            type: sourceType || 'gis_dataset'
          },
          user_id: userId,
          tableDescriptor,
          gisUploadId,
          layerName,
          etlContextId,
          customViewAttributes,
          mbtilesOptions,
          fileName: state?.uploadedFile?.name
        };

        console.log('publish', publishData)

        const res = await fetch(`${state.damaServerPath}/hubbound/publish`, 
        {
          method: "POST",
          body: JSON.stringify(publishData),
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const publishFinalEvent = await res.json();
        console.log('publishFinalEvent', publishFinalEvent)

        const { etl_context_id, source_id } = publishFinalEvent

        dispatch({ type: 'update', payload: { publishStatus : 'PUBLISHED',  damaSourceId: source_id, etlContextId: etl_context_id }});
      } catch (err) {
        dispatch({
          type: 'update', 
          payload: { 
            publishStatus : 'ERROR', 
            publishErrMsg: err.message 
          }
        });
        console.error("==>", err);
      }
    }
    runPublish()
  }

  return (
    <div className='mt-8'>
      <div className='flex gap-8'>
        <div>
          <button
            className={`cursor-pointer py-4 px-8 ${publishButtonBgColor} border-none`}
            //disabled={publishStatus'AWAITING'}
            onClick={() => {
              console.log('onClick publush', publishStatus)
              if (publishStatus === "AWAITING" || publishStatus === "ERROR" ) {
                publish();
              }
            }}
          >
            {publishButtonText}
          </button>
        </div>
        {state.publishState !== "ERROR" && existingHubboundSources?.length ? 
          <div>
            Append to Existing Hubbound Source?
            <FilterControlContainer 
              header={'Source:'}
              input={({className}) => {
                return (
                  <div className="flex">
                    <select
                      className={className}
                      value={existingHubboundSourceId}
                      onChange={(e) => {
                        dispatch({ type: "update", payload: { existingHubboundSourceId: e.target.value } })
                      }}
                    >
                      <option value={''}></option>
                      {existingHubboundSources?.map((existingSource, i) => (
                        <option key={`${i}_existing_hub_source`} className="ml-2  truncate" value={existingSource.source_id}>
                          {existingSource.name}
                        </option>
                      ))}
                    </select>
                  </div> 
                )
              }}
            />
            {existingHubboundSourceId && (
              <FilterControlContainer 
                header={'View:'}
                input={({className}) => {
                  return (
                    <div className="flex">
                      <select
                        className={className}
                        value={existingHubboundViewId}
                        onChange={(e) => {
                          dispatch({ type: "update", payload: { existingHubboundViewId: e.target.value } })}
                        }
                      >
                        <option value={''}></option>
                        {views?.map((existingView, i) => (
                          <option key={`${i}_existing_hub_view`} className="ml-2  truncate" value={existingView.view_id}>
                            {existingView?.version ?? existingView.view_id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                }}
              />
            )}
          </div> : <></>
      }
      </div>

      <PublishErrorMessage state={state} />
    </div>
  );
}

function PublishErrorMessage({state}) {
  
  const { 
    etlContextId, 
    publishStatus, 
    publishErrMsg 
  } = state

  if (publishStatus !== "ERROR") {
    return "";
  }

  return (
    <table
      className="w-2/3"
      style={{
        margin: "40px auto",
        textAlign: "center",
        border: "1px solid",
        borderColor: "back",
      }}
    >
      <thead
        style={{
          color: "black",
          backgroundColor: "red",
          fontWeight: "bolder",
          textAlign: "center",
          marginTop: "40px",
          fontSize: "20px",
          border: "1px solid",
          borderColor: "black",
        }}
      >
        <tr>
          <th style={{ border: "1px solid", borderColor: "black" }}>
            {" "}
            Publish Error
          </th>
          <th style={{ border: "1px solid", borderColor: "black" }}>
            {" "}
            ETL Context ID
          </th>
        </tr>
      </thead>
      <tbody style={{ border: "1px solid" }}>
        <tr style={{ border: "1px solid" }}>
          <td
            style={{
              border: "1px solid",
              padding: "10px",
              backgroundColor: "white",
              color: "darkred",
            }}
          >
            {publishErrMsg}
          </td>
          <td style={{ border: "1px solid", backgroundColor: "white" }}>
            {etlContextId}
          </td>
        </tr>
      </tbody>
    </table>
  );
}


