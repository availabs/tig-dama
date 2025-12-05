import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import download from "downloadjs"
import { Button } from "~/modules/avl-components/src"
import { get } from "lodash";
import { Table } from "~/modules/avl-components/src";
import { useParams } from "react-router";

import { DamaContext } from "~/pages/DataManager/store";

import { HUBBOUND_ATTRIBUTES } from "../constants";
import { createHubboundFilterClause } from "../utils";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";
import { FilterControlContainer } from "../../controls/FilterControlContainer";
var geometries = ["county", "tracts"];

const DefaultTableFilter = () => <div />;

const identityMap = (tableData, attributes) => {
  return {
    data: tableData,
    columns: attributes?.map((d) => ({
      Header: d,
      accessor: d,
    })),
  };
};

const TablePage = ({
  source,
  views,
  transform = identityMap,
  filterData = {},
  TableFilter = DefaultTableFilter,
  fullWidth = false,
  userHighestAuth
}) => {
  const { viewId, sourceId } = useParams();
  const [filters, _setFilters] = useState(filterData);
  const [tableColumns, setTableColumns] = useState([]);
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);
  const { pgEnv, falcor, falcorCache } = useContext(DamaContext);

  const activeView = useMemo(() => {
    return get(
      views?.filter((d) => d.view_id === viewId),
      "[0]",
      views[0]
    );
  }, [views, viewId]);

  const activeViewId = useMemo(
    () => get(activeView, "view_id", null),
    [activeView]
  );

  const year = filters?.year?.value;
  const direction = filters?.direction?.value;

  const yearRange = useMemo(() => {
    return get(
      falcorCache,
      [
        "dama",
        pgEnv,
        "views",
        "byId",
        activeViewId,
        "attributes",
        "metadata",
        "value",
        "years",
      ],
      []
    );
  }, [pgEnv, falcorCache, activeViewId]);

  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value:[ yearRange[0]] }
    }
    if(!direction){
      newFilters.direction = { value: "all" }
    }
    setFilters(newFilters)
  }, []);

  useEffect(() => {
    setTableColumns(Object.keys(HUBBOUND_ATTRIBUTES));
  }, []);

  const hubboundDetailsOptions = useMemo(() => {
    return createHubboundFilterClause(filters);
  }, [filters]);

  const hubboundDetailsPath = useMemo(() => {
    return [
      "dama",
      pgEnv,
      "viewsbyId",
      activeViewId,
      "options",
      hubboundDetailsOptions,
    ]
  }, [pgEnv, activeViewId, hubboundDetailsOptions] )

  useEffect(() => {
    async function fetchData() {
      console.log("getting view data")
  
      const lenRes = await falcor.get([...hubboundDetailsPath, 'length']);
      const len = get(lenRes, ['json', ...hubboundDetailsPath, 'length'], 0);
  
      await falcor.get([...hubboundDetailsPath, 'databyIndex', {
          from: 0,
          to: len - 1
      }, Object.keys(HUBBOUND_ATTRIBUTES)]);
    }

    fetchData();
  }, [falcorCache, pgEnv, activeViewId, activeView, hubboundDetailsOptions])

  const tableData = useMemo(() => {
    const tableDataPath = [
      ...hubboundDetailsPath,
      "databyIndex",
    ];
    const tableData = get(falcorCache, tableDataPath, {});

    return Object.values(tableData);
  }, [activeViewId, falcorCache, tableColumns, hubboundDetailsPath]);

  const { data, columns } = useMemo(() => {
    return transform(tableData, tableColumns, filters, setFilters, yearRange);
  }, [tableData, tableColumns, filters, setFilters, yearRange]);

  //Without this, would be unable to remove filters that result in 0 rows
  if(data.length === 0){
    data.push({})
  }

  let containerStyle = {};
  let containerClassName = "";

  if (fullWidth) {
    containerStyle = {
      width: "96vw",
      position: "absolute",
      left: "calc(-50vw + 50%)",
    };
    containerClassName = "mt-2 mx-12";
  }

  const downloadData = React.useCallback(() => {
    const mapped = data.map(d => {
      return columns.map(c => {
        return d[c.accessor];
      }).join(",")
    })
    mapped.unshift(columns.map(c => c.Header).join(","));
    download(mapped.join("\n"), `hubbound_${year}_${direction}.csv`, "text/csv");
  }, [data, columns]);

  return (
    <div className={containerClassName} style={containerStyle}>
    {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="px-2 ml-auto">
      <FilterControlContainer
        header={""}
        input={({ className }) => (
          <div>
            <Button
              themeOptions={{ size: "sm", color: "primary" }}
              onClick={downloadData}
            >
              Download
            </Button>
          </div>
        )}
      />
      </div>}
      <Table data={data} columns={columns} pageSize={15} striped={true}/>
    </div>
  );
};

export default TablePage;
