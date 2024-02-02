import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { get, uniq } from "lodash";
import { Table } from "~/modules/avl-components/src";
import { useParams, useNavigate } from "react-router-dom";

import { DamaContext } from "~/pages/DataManager/store";

var geometries = ["county", "tracts"];

const OUTBOUND_VAL = "Outbound";

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

  const year = filters?.year?.value || 2019;
  const direction = filters?.direction?.value || OUTBOUND_VAL;

  console.log("year filter value", year)

  const years = useMemo(() => {
    //RYAN TODO set hubbound metadata on source create
    const finishYear = 2020;
    const startYear = 2007;
    return Array.from(
      { length: finishYear - startYear },
      (_, i) => startYear + 1 + i
    );
  }, []);

  //RYAN TODO this cannot be hardcoded. Path values will be determined by filters
  const dataPath = useMemo(() => {
    console.log({year})
    const yearParam = year === 'all' ? years : [year]
    return [
      "dama",
      [pgEnv],
      "hubbound",
      [activeViewId],
      yearParam,
      [direction],
    ];
  }, [year, direction, activeViewId]);


  useEffect(() => {
    setTableColumns(source.metadata.map((column) => column.name));
  }, []);

  useEffect(() => {
    console.log("getting view data")
    async function getViewData() {
      falcor.chunk(dataPath);
    }
    getViewData();
  }, [falcorCache, pgEnv, activeViewId, activeView, year, direction]);

  //RYAN TODO this is where you format the table data
  const tableData = useMemo(() => {
    const newDataPath = ['dama', pgEnv, 'hubbound', [activeViewId]];

    const newData = get(falcorCache, newDataPath, {});

    //only access newData[yearVal] for values in year filter
    //Do the same for all possible filters (data is nested)

    //pull out data that matches filter paths, send it to table

    console.log({falcorCache})
    console.log({newData})

    const data = get(falcorCache, dataPath, {});
    console.log({data})
    const finalData = data?.value;
    return finalData;
  }, [activeViewId, falcorCache, tableColumns]);

  const { data, columns } = useMemo(() => {
    return transform(tableData, tableColumns);
  }, [tableData]);

  return (
    <div>
      <div className="flex">
        <div className="flex-1 pl-3 pr-4 py-2">Table View</div>
        <TableFilter
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
