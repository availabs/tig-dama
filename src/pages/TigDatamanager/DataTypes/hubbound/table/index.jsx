import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { get } from "lodash";
import { Table } from "~/modules/avl-components/src";
import { useParams } from "react-router-dom";

import { DamaContext } from "~/pages/DataManager/store";

import { HUBBOUND_ATTRIBUTES } from "../constants";
import { createHubboundFilterClause } from "../utils";

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

  const year =  filters?.year?.value;
  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value: 2019 }
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
    return transform(tableData, tableColumns, filters, setFilters);
  }, [tableData, tableColumns, filters, setFilters]);

  //Without this, would be unable to remove filters that result in 0 rows
  if(data.length === 0){
    data.push({})
  }

  return (
    <div className="mt-2 mx-12" style={{width:"95vw", position:"relative", left:"calc(-50vw + 50%)"}}>
      <Table data={data} columns={columns} pageSize={15} />
    </div>
  );
};

export default TablePage;
