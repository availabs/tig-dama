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

import {HUBBOUND_ATTRIBUTES} from '../constants';

var geometries = ["county", "tracts"];

const FILTERS_TO_EXCLUDE = ['out_station_name', "transit_route_name",'latitude', 'longitude', 'count']

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

  console.log("filters", filters)

  const years = useMemo(() => {
    //RYAN TODO set hubbound metadata on source create
    const finishYear = 2020;
    const startYear = 2007;
    return Array.from(
      { length: finishYear - startYear },
      (_, i) => startYear + 1 + i
    );
  }, []);

  useEffect(() => {
    setTableColumns(Object.keys(HUBBOUND_ATTRIBUTES));
  }, []);

  const hubboundDetailsOptions = useMemo(() => {
    const filterClause = Object.keys(filters).reduce((a,c) => {
      if(filters[c].value && filters[c].value !== "all"){
        a[c] = [filters[c].value];
      }


      return a;
    }, {});

    return JSON.stringify({
      filter: filterClause,
    });
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
    return transform(tableData, tableColumns);
  }, [tableData]);

  return (
    <div>
      <div className="flex">
        <TableFilter
          filtersToExclude={FILTERS_TO_EXCLUDE}
          filters={filters}
          setFilters={setFilters}
          years={years}
          geometries={geometries}
          data={data}
          columns={columns}
          tableColumns={tableColumns}
          setTableColumns={setTableColumns}
        />
      </div>
      <div className="max-w-6xl mt-2">
        <Table data={data} columns={columns} pageSize={50} />
      </div>
    </div>
  );
};

export default TablePage;
