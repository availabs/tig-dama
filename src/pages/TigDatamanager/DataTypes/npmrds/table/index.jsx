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
import { getInitialYearAndMonth } from "../map/npmrdsMapFilter";
import { NPMRDS_ATTRIBUTES } from "../constants";
import moment from 'moment'

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

  const availableYears = useMemo(() => {
    if(source) {
      return Object.keys(source?.metadata?.npmrds_meta_layer_view_id).reverse().map(year => parseInt(year));
    }
  }, [source]);

  useEffect(() => {
    const {
      year: initYear,
      month: initMonth
    } = getInitialYearAndMonth()
    const newFilters = { ...filters };
    if (!year) {
      newFilters.year = { value: availableYears.includes(initYear) ? initYear : availableYears[0] };
    }
    if (!month) {
      newFilters.month = { value:  initMonth };
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

  const tmcDataReqKey = useMemo(() => {
    const startOfMonth = moment([year, month - 1]).startOf('month').format('YYYYMMDD');
    const endOfMonth = moment([year, month - 1]).endOf('month').format('YYYYMMDD');
    const startEpoch = 0
    const endEpoch = (24) * 12;
    return `${NPMRDS_ATTRIBUTES.counties.values.join(",")}|${startOfMonth}|${endOfMonth}|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|speed|%7B%7D|ny`
  },[year, month])

  const tmcData = useMemo(
    () =>
      get(falcorCache, [
        "routes",
        pgEnv,
        "view",
        activeViewId,
        "data",
        tmcDataReqKey,
        "value",
      ], []),
    [falcorCache, tmcDataReqKey]
  );

  useEffect(() => {
    const getData = async () => {
      console.log("START req data for tmcs")
      const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', tmcDataReqKey];
      console.time("just data REQ")
      const tmcDataRes = await falcor.get(tmcDataBasePath);
      console.timeEnd("just data REQ")
      const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', tmcDataReqKey])

      setTableData(tmcData);
    }

    if(year && month) {
      getData();
    }
  }, [tmcDataReqKey])

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
