import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { get } from "lodash";
import {
  Button,
  useFalcor,
  ScalableLoading,
} from "~/modules/avl-components/src";

import { DamaContext } from "~/pages/DataManager/store";
import { Select } from "./../singleSelect";
import { API_HOST, PG_ENV } from "~/config";

import {
  ViewAttributes,
  getAttributes,
} from "~/pages/DataManager/Source/attributes";

import ACSVariableUpdate from "./variables";
import ACSYearsUpdate from "./years";

const Update = () => {
  const { falcor, falcorCache } = useFalcor();
  const navigate = useNavigate();
  const { sourceId } = useParams();
  const { pgEnv } = useContext(DamaContext);
  const [loading, setLoading] = useState(false);
  const [selectedVariables, setSelecteVariableOptions] = useState(null);
  const [selectedYears, setSelectedYears] = useState(null);
  const [selectedView, setSelecteView] = useState(null);

  useEffect(() => {
    async function getData() {
      const lengthPath = [
        "dama",
        pgEnv,
        "sources",
        "byId",
        sourceId,
        "views",
        "length",
      ];

      const resp = await falcor.get(lengthPath);
      await falcor.get([
        "dama",
        pgEnv,
        "sources",
        "byId",
        sourceId,
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
    getData();
  }, [falcor, sourceId, pgEnv]);

  const views = useMemo(() => {
    return Object.values(
      get(
        falcorCache,
        ["dama", pgEnv, "sources", "byId", sourceId, "views", "byIndex"],
        {}
      )
    ).map((v) =>
      getAttributes(get(falcorCache, v.value, { attributes: {} })["attributes"])
    );
  }, [falcorCache, sourceId, pgEnv]);

  const viewOptions = useMemo(() => {
    return (views || []).map((v) => ({
      id: v.view_id,
      value: v?.table_name || "N/A",
      source_id: v?.source_id,
    }));
  }, [views]);

  if (viewOptions && viewOptions[0] && !selectedView) {
    setSelecteView(viewOptions[0]);
  }

  const [viewDependency, metadata, variables, years] = useMemo(() => {
    const selectedViewData =
      views.find((v) => v.view_id === selectedView?.id) || {};

    return [
      get(selectedViewData, "view_dependencies", {})?.[0] || [],
      get(selectedViewData, "metadata", {}),
      get(selectedViewData, "metadata.variables", []),
      get(selectedViewData, "metadata.years", []),
    ];
  }, [views, selectedView]);

  useEffect(() => {
    if (variables && !selectedVariables) {
      setSelecteVariableOptions(variables);
    }
  }, [variables]);

  useEffect(() => {
    if (years && !selectedYears) {
      setSelectedYears(years);
    }
  }, [years]);

  const UpdateView = (attr, value) => {
    if (selectedView && selectedView.id) {
      const { id: view_id } = selectedView;
      try {
        falcor.set({
          paths: [
            ["dama", pgEnv, "views", "byId", view_id, "attributes", "metadata"],
          ],
          jsonGraph: {
            dama: {
              [pgEnv]: {
                views: {
                  byId: {
                    [view_id]: {
                      attributes: {
                        ["metadata"]: JSON.stringify(value),
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const runScript = (params, navigate) => {
    const runPublish = async () => {
      setLoading(true);
      try {
        const publishData = {
          serverUrl: `${API_HOST}/graph`,
          view_id: params.id,
          source_id: params.source_id,
          viewDependency: params.viewDependency,
          ...params.metadata,
          pgEnv: PG_ENV,
        };

        const res = await fetch(`${API_HOST}/dama-admin/${PG_ENV}/acs/cache/${params.id}`, {
          method: "POST",
          body: JSON.stringify(publishData),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const finalEvent = await res.json();
        const { etl_context_id, source_id } = finalEvent;
        if (etl_context_id && source_id) {
          navigate(`/source/${source_id}/uploads/${etl_context_id}`);
        }
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    runPublish();
  };

  return (
    <>
      <div className="w-full max-w-lg">
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-counties"
            >
              Select View
            </label>
            <Select
              selectedOption={selectedView}
              options={viewOptions}
              setSelecteOptions={setSelecteView}
            />
          </div>
        </div>

        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="grid-years"
        >
          Years
        </label>
      </div>

      <div className="flex-wrap">
        <ACSYearsUpdate years={selectedYears} setYears={setSelectedYears} />
      </div>

      <div className="w-full max-w-lg mt-7">
        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="grid-counties"
        >
          Variables
        </label>
      </div>

      <div className="flex-wrap">
        <ACSVariableUpdate
          variables={selectedVariables}
          setVariables={setSelecteVariableOptions}
        />
      </div>

      <div className="mt-6 mb-6">
        <Button
          className="rounded-lg"
          themeOptions={{ size: "sm", color: "primary" }}
          onClick={() => {
            UpdateView(
              "metadata",
              Object.assign({}, metadata, {
                variables: selectedVariables,
                years: selectedYears,
              })
            );
            runScript(
              {
                ...selectedView,
                metadata: Object.assign({}, metadata, {
                  variables: selectedVariables,
                  years: selectedYears,
                }),
                viewDependency,
              },
              navigate
            );
          }}
        >
          {" "}
          {loading ? (
            <div style={{ display: "flex" }}>
              <div className="mr-2">Saving</div>
              <div>
                <ScalableLoading scale={0.25} color={"#fefefe"} />
              </div>
            </div>
          ) : (
            <>Save </>
          )}
        </Button>
      </div>
    </>
  );
};

export default Update;
