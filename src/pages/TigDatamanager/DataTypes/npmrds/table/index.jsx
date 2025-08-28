import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { get } from "lodash";
import { range as d3range } from "d3-array"
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
const INITIAL_PAGE_SIZE = 50;
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
  const [pageIndex, setPageIndex] = React.useState(0);
  const tableIndicies = React.useMemo(() => {
    return d3range(pageIndex * INITIAL_PAGE_SIZE, pageIndex * INITIAL_PAGE_SIZE + INITIAL_PAGE_SIZE);
  }, [pageIndex, INITIAL_PAGE_SIZE]);

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
      //newFilters.year = { value: availableYears.includes(initYear) ? initYear : availableYears[0] };
      newFilters.year = {value: 2025};//TEMP until data is more current
    }
    if (!month) {
      //newFilters.month = { value:  initMonth };
      newFilters.month = { value:  '6' };//TEMP until data is more current
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
  const {
    year: initYear,
    month: initMonth
  } = getInitialYearAndMonth()

  //when I pass this function, it should have all the data it needs BESIDES indicies (and sort?)
  const fetchData = async ({currentPage, pageSize}) => {
    const allIndicies = d3range(currentPage * pageSize, currentPage * pageSize + pageSize)
    const innerMonth = month ?? initMonth;
    const innerYear = year ?? initYear ?? availableYears[0]
    const startOfMonth = moment([innerYear, innerMonth - 1]).startOf('month').format('YYYYMMDD');
    const endOfMonth = moment([innerYear, innerMonth - 1]).endOf('month').format('YYYYMMDD');
    //TODO indicies will be via table control, orderBy will be a combination of columnName and Direction
    const indicies = JSON.stringify({
      indicies: {
        from: allIndicies[0],
        to: allIndicies[allIndicies.length - 1],
      },
      orderBy: "tmc",
      orderDirection: "asc",
    });

    const startEpoch = 0
    const endEpoch = (24) * 12;
    const dataReqKey = `${NPMRDS_ATTRIBUTES.counties.values.join(",")}|${startOfMonth}|${endOfMonth}|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|speed|${indicies}|ny`
    const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', dataReqKey];

    const tmcDataRes = await falcor.get(tmcDataBasePath);

    const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', dataReqKey]);
    return {data: transform(tmcData, tableColumns, filters, setFilters).data, length: tmcLength};
  }

  const tmcDataReqKey = useMemo(() => {
    const startOfMonth = moment([year, month - 1]).startOf('month').format('YYYYMMDD');
    const endOfMonth = moment([year, month - 1]).endOf('month').format('YYYYMMDD');
    //TODO indicies will be via table control, orderBy will be a combination of columnName and Direction
    const indicies = JSON.stringify({
      indicies: {
        from: tableIndicies[0],
        to: tableIndicies[tableIndicies.length - 1],
      },
      orderBy: "tmc",
      orderDirection: "asc",
    });
    console.log({tableIndicies, indicies})
    const startEpoch = 0
    const endEpoch = (24) * 12;
    return `${NPMRDS_ATTRIBUTES.counties.values.join(",")}|${startOfMonth}|${endOfMonth}|${startEpoch}|${endEpoch}|monday,tuesday,wednesday,thursday,friday|hour|travel_time_all|speed|${indicies}|ny`
  },[year, month, pageIndex])

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
  const metaViewId = useMemo(() => {
    return source?.metadata?.npmrds_meta_layer_view_id[year];
  }, [source, year]);

  const metaColumns = ['tmc', 'miles', 'nhs', 'road', 'avg_speedlimit', 'start_latitude', 'start_longitude', 'end_latitude', 'end_longitude'];
  const metaOptions = useMemo(() => {
      if(direction && direction.length === 1){
        metaColumns.push(direction)
      }
      const options = JSON.stringify({
        aggregatedLen: true,
        groupBy: metaColumns,
      })

      return options
  }, [direction])


  const lengthReq = useMemo(() => {
    return ['dama', pgEnv, 'viewsbyId', metaViewId, 'options', metaOptions, 'length' ];  
  }, [pgEnv, metaViewId, metaOptions])
  useEffect(() => {
    const getMetadataForTmcs = async () => {
      await falcor.get(lengthReq), ['json', ...lengthReq];
    }
    if(metaViewId && year) {
      getMetadataForTmcs()
    }

  }, [source, year]);

  const tmcLength = useMemo(() => {
    return get(falcorCache, lengthReq)
  }, [falcorCache])
  // const tmcMeta = useMemo(() => {
  //   console.log("tmc meta, metaOptioins::", metaOptions)
  //   const databyIndex = get(falcorCache, [
  //       'dama',pgEnv,'viewsbyId', metaViewId, 'options', metaOptions, 'databyIndex'], {})

  //   const metaByTmcId = Object.values(databyIndex).reduce((acc, curr) => {
  //     acc[curr.tmc] = {...curr}
        
  //     return acc;
  //   }, {})

  //   //console.log({metaByTmcId})
  //   return metaByTmcId;
  // }, [falcorCache])
  // console.log("OUTER",{tmcMeta})
  // useEffect(() => {
  //   const getData = async () => {
  //     console.log("START req data for tmcs")
  //     const tmcDataBasePath = ['routes', pgEnv, 'view', activeViewId, 'data', tmcDataReqKey];
  //     console.time("just data REQ")
  //     const tmcDataRes = await falcor.get(tmcDataBasePath);
  //     console.timeEnd("just data REQ")
  //     const tmcData = get(tmcDataRes, ["json", "routes", pgEnv, 'view', activeViewId, 'data', tmcDataReqKey])
  //     console.log({tmcData})
  //     setTableData(tmcData);
  //   }

  //   if(year && month) {
  //     getData();
  //   }
  // }, [tmcDataReqKey])

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

      <Table
        // data={data}
        fetchData={fetchData}
        pageSize={INITIAL_PAGE_SIZE}
        onPageChange={setPageIndex}
        manualCurrentPage={pageIndex}
        manualPagination={true}
        numRecords={tmcLength}
        columns={columns}
        striped={true}
        sortBy={"tmc"}
        sortOrder="asc"
        disableFilters
      />
    </div>
  );
};

export default NpmrdsTable;
