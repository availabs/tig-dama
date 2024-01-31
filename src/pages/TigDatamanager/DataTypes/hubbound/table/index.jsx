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
  
  const OUTBOUND_VAL = 'Outbound';
  const INBOUND_VAL = 'Inbound'
  
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

    const years = useMemo(() => {
      return get(activeView, "metadata.years", []);
    }, [activeView]);
  
    //RYAN TODO this cannot be hardcoded. Path values will be determined by filters
    const HARDCODED_PATH = [
      "dama",
      [pgEnv],
      "hubbound",
      [activeViewId],
      [2008], //RYAN TODO this cannot be hardcoded
      [OUTBOUND_VAL], //RYAN TODO maybe do something so this isn't annoyingly case-sensitive
    ]

    //RYAN MAYBE TODO -- on create, or in backend, set Metadata for Hubbound type. That way we have years.
    useEffect(() => {
      setTableColumns(source.metadata.map(column => column.name));
    }, []);

    useEffect(() => {
      async function getViewData() {
        falcor
          .chunk(HARDCODED_PATH);
      }
      getViewData();
    }, [falcorCache, pgEnv, activeViewId, activeView]);
  
    //RYAN TODO this is where you format the table data
    const tableData = useMemo(() => {
      const data = get(falcorCache, HARDCODED_PATH, {});      
      const finalData = data?.value;
      return finalData;
    }, [
      activeViewId,
      falcorCache,
      tableColumns,
    ]);
  
    const { data, columns } = useMemo(() => {
      return transform(tableData,tableColumns);
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
  