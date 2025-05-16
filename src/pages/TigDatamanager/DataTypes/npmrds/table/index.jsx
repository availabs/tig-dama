import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { get } from "lodash";
import { Table } from "~/modules/avl-components/src";
import { useParams } from "react-router";
import { NpmrdsFilters } from "../filters";
import { NPMRDS_ATTRIBUTES } from "../constants";

const GEO_LEVEL = 'COUNTY';

import { DamaContext } from "~/pages/DataManager/store"

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

const NpmrdsTable = ({
  source,
  views,
  transform = identityMap,
  filterData = {},
  TableFilter = DefaultTableFilter,
  fullWidth = false
}) => {
  const { falcor, falcorCache, pgEnv } = React.useContext(DamaContext);
  const tig_falcor = falcor;
  const { viewId, sourceId } = useParams();
  const [filters, _setFilters] = useState(filterData);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);

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
  const month = filters?.month?.value;
  const direction = filters?.direction?.value;
  const tmc = filters?.tmc?.value;

  useEffect(() => {
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: 2020 };
    }
    if (!month) {
      newFilters.month = { value:  NPMRDS_ATTRIBUTES["month"].values[5] };
    }
    if (!direction) {
      newFilters.direction = {
        value: [],
      };
    }
    if (!tmc) {
      newFilters.tmc = { value: [] };
    }
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    //TODO missing  "Roadway Number" column
    const columns = ["tmc", "roadname", "direction"];
    setTableColumns([...columns, ...NPMRDS_ATTRIBUTES["hour"].values]);
  }, []);


  useEffect(() => {
    async function getData() {    
      // geoids = filters.geography.domain.filter(d => d.name === filters.geography.value)[0].value,

      let requests = NPMRDS_ATTRIBUTES['counties'].values.reduce((a, c) => {
          a.push(['tig', 'npmrds', `${month}|${year}`, `${GEO_LEVEL}|${c}`, 'data'])
          // a.push(["geo", GEO_LEVEL.toLowerCase(), `${c}`, "geometry"]);
          return a;
      }, [])

      const response = await tig_falcor.get(...requests);
      const respData = NPMRDS_ATTRIBUTES['counties'].values
        .map((d) =>
          get(
            response,
            [
              "json",
              "tig",
              "npmrds",
              `${month}|${year}`,
              `${GEO_LEVEL}|${d}`,
              "data",
            ],
            []
          )
        )
        .reduce((out, d) => ({ ...out, ...d }), {});

      const tmcArray = Object.keys(respData).map(tmcId => ({
        tmc: tmcId,
        ...respData[tmcId]
      }))

      setTableData(tmcArray);
    }

    if(year && month) {
      getData();
    }
  }, [year, month])

  const { data, columns } = useMemo(() => {
    return transform(tableData, tableColumns, filters, setFilters);
  }, [tableData, tableColumns, filters, setFilters]);

  //Without this, would be unable to remove filters that result in 0 rows
  if(data?.length === 0){
    data.push({})
  }

  let containerStyle = {};
  let containerClassName = "";

  if (fullWidth) {
    containerStyle = {
      width: "96vw",
      position: "relative",
      left: "calc(-50vw + 50%)",
    };
    containerClassName = "mt-2 mx-12";
  }
  const filterSettings = {...NPMRDS_ATTRIBUTES, tmc: {...NPMRDS_ATTRIBUTES.tmc, values: [""].concat(tableData.map(tmcRow => tmcRow.tmc))}};

  return (
    <div className={containerClassName} style={containerStyle}>
      <NpmrdsFilters filterSettings={filterSettings} filterType={"tableFilter"} filters={filters} setFilters={setFilters}/>

      <Table data={data} columns={columns} pageSize={15} striped={true}/>
    </div>
  );
};

export default NpmrdsTable;
