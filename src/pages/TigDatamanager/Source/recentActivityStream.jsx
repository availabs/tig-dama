import { useNavigate } from "react-router-dom";
import { range as d3range } from "d3-array";
import get from "lodash/get";
import { useMemo, useState, useContext, useEffect, useCallback } from "react";
import { DamaContext } from "~/pages/DataManager/store";
import { ETL_CONTEXT_ATTRS } from "~/pages/DataManager/Tasks/TaskList";

const HOVER_LINK_CLASS = 'hover:text-[#E47B44]';

export const RecentActivityStream = () => {
  return (
    <div>
      <ActivityStreamHeader />
      <ActivityStreamList />
    </div>
  );
};

const ActivityStreamHeader = () => {
  const { baseUrl } = useContext(DamaContext);
  const navigate = useNavigate();
  const showMore = useCallback((e) => {
      if (e.ctrlKey) {
        window.open(`${baseUrl}/tasks`, "_blank");
      } else {
        navigate(`${baseUrl}/tasks`);
      }
    },
    [navigate]
  );
  return (
    <div className="flex items-center border-t-2 mb-4 border-[#679d89]">
      <div
        onClick={showMore}
        className="py-3 px-6 bg-[#679d89] text-lg text-gray-100 hover:cursor-pointer hover:text-[#bbd4cb]"
      >
        Recent Activity
      </div>
    </div>
  );
};
const INITIAL_PAGE_SIZE = 10;

const ActivityStreamList = () => {
  const { pgEnv, falcor, falcorCache, baseUrl } = useContext(DamaContext);

  const [pageIndex, setPageIndex] = useState(0);
  const indices = useMemo(() => {
    return d3range(
      pageIndex * INITIAL_PAGE_SIZE,
      pageIndex * INITIAL_PAGE_SIZE + INITIAL_PAGE_SIZE
    );
  }, [pageIndex, INITIAL_PAGE_SIZE]);

  const dataFetchPath = [
    "dama",
    pgEnv,
    "latest",
    "events",
    indices,
    ETL_CONTEXT_ATTRS,
  ];

  //fetch data
  useEffect(() => {
    const fetchData = async () => {
      await falcor.get(dataFetchPath).then((data) => {
        //Removes indicies and attribute list
        const dataPath = dataFetchPath.slice(0, dataFetchPath.length - 2);
        const sourceIds = Object.values(get(data, ["json", ...dataPath]))
          .map((etlContext) => etlContext.source_id)
          .filter((sourceId) => !!sourceId);

        return falcor.get([
          "dama",
          pgEnv,
          "sources",
          "byId",
          sourceIds,
          "attributes",
          "name",
        ]);
      });
    };

    fetchData();
  }, [falcor, pgEnv, indices]);

  const parsedData = useMemo(() => {
    const dataPath = dataFetchPath.slice(0, dataFetchPath.length - 2);
    return indices
      .map((i) => ({
        ...get(falcorCache, [...dataPath, i]),
      }))
      .map((r) => {
        if (r.source_id) {
          const sourceName = get(falcorCache, [
            "dama",
            pgEnv,
            "sources",
            "byId",
            r.source_id,
            "attributes",
            "name",
          ]);
          r.source_name = sourceName;
        }
        r.source_name = typeof r.source_name === 'string' ? r.source_name : null;
        return r;
      })
      .filter((r) => typeof r.source_name === 'string' && Boolean(r.etl_context_id));
  }, [indices, falcorCache]);

  const navigate = useNavigate();
  const onRowClick = useCallback(
    (e, row) => {
      if (row.source_id) {
        if (e.ctrlKey) {
          window.open(`${baseUrl}/source/${row.source_id}`, "_blank");
        } else {
          navigate(`${baseUrl}/source/${row.source_id}`);
        }
      }
    },
    [navigate]
  );

  const showMore = useCallback((e) => {
      if (e.ctrlKey) {
        window.open(`${baseUrl}/tasks`, "_blank");
      } else {
        navigate(`${baseUrl}/tasks`);
      }
    },
    [navigate]
  );

  return (
    <>
      {parsedData.map((etlCtx) => {
        const createdAtDate = new Date(etlCtx?.created_at);
        const options = {
          year: "numeric",
          month: "short",
          day: "numeric",
        };

        let byLine = '';
        if (typeof etlCtx?.user === 'string' && etlCtx?.user?.includes("@")) {
          byLine = <><b>{etlCtx?.user}</b> updated '{etlCtx.source_name}'</>;
        }
        else if (typeof etlCtx.user !== 'object') {
          byLine = <><b>User {etlCtx.user}</b> updated '{etlCtx.source_name}'</>;
        }
        else {
          byLine = `'${etlCtx.source_name}' updated`
        }

        return (
          <div key={`recent_activity_${etlCtx?.etl_context_id}`} className="text-xs py-4 flex items-center border-t border-[#679d89]">
            <div
              className={`flex items-center hover:underline hover:cursor-pointer ${HOVER_LINK_CLASS}`}
              onClick={(e) => {
                onRowClick(e, etlCtx);
              }}
            >
              <div className="italic pr-1">
                {createdAtDate.toLocaleTimeString(undefined, options)}:
              </div>
              <div>{byLine}</div>
            </div>
          </div>
        );
      })}
      <div className={`text-xs text-right hover:cursor-pointer ${HOVER_LINK_CLASS}`} onClick={showMore}>Show More</div>
    </>
  );
};
