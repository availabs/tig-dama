import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { get, uniq } from "lodash";
import { Table } from "~/modules/avl-components/src";
import { useParams, useNavigate } from "react-router";
import { FilterControlContainer } from "../../controls/FilterControlContainer"

import { DamaContext } from "~/pages/DataManager/store";

var geometries = ["county", "tracts"];

const ViewSelector = ({ views }) => {
  const { viewId, sourceId, page } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = React.useContext(DamaContext);

  return (
    <FilterControlContainer
      header={"Version: "}
      input={({ className }) => (
        <select
          className={className}
          value={viewId}
          onChange={(e) =>
            navigate(`${baseUrl}/source/${sourceId}/${page}/${e.target.value}`)
          }
        >
          {views
            .sort((a, b) => b.view_id - a.view_id)
            .map((v, i) => (
              <option key={i} className="ml-2  truncate" value={v.view_id}>
                {v.version ? v.version : v.view_id}
              </option>
            ))}
        </select>
      )}
    />
  );
};

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
  views,
  transform = identityMap,
  filterData = {},
  TableFilter = DefaultTableFilter,
  fullWidth = false,
  userHighestAuth
}) => {
  const { viewId } = useParams();
  const [filters, _setFilters] = useState(filterData);
  const [acsTractGeoids, setAcsTractGeoids] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const setFilters = useCallback((filters) => {
    _setFilters((prev) => ({ ...prev, ...filters }));
  }, []);
  const { pgEnv, falcor, falcorCache } = useContext(DamaContext);

  const [geometry, year] = useMemo(() => {
    return [filters?.geometry?.value || "county", filters?.year?.value || 2019];
  }, [filters]);

  const viewYear = useMemo(() => year - (year % 10), [year]);
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

  const [variablesToCensusKeys, variablesToDivisorKeys] = useMemo(() => {
    return [
      get(activeView, "metadata.variables", []).reduce((acc, cur) => {
        acc[`${cur?.label}`] =
          (cur?.value?.censusKeys || []).filter((key) => Boolean(key)) || [];
        return acc;
      }, {}),
      get(activeView, "metadata.variables", []).reduce((acc, cur) => {
        acc[`${cur?.label}`] =
          (cur?.value?.divisorKeys || []).filter((key) => Boolean(key)) || null;
        return acc;
      }, {}),
    ];
  }, [activeView]);

  const years = useMemo(() => {
    return get(activeView, "metadata.years", []);
  }, [activeView]);

  useEffect(() => {
    if (
      variablesToCensusKeys &&
      Object.keys(variablesToCensusKeys) &&
      Object.keys(variablesToCensusKeys).length
    ) {
      setTableColumns(Object.keys(variablesToCensusKeys));
    }
  }, []);

  const geoids = useMemo(
    () => get(activeView, "metadata.counties", []),
    [activeView]
  );

  useEffect(() => {
    async function getViewData() {
      falcor
        .get([
          "dama",
          [pgEnv],
          "tiger",
          activeView?.view_dependencies,
          geoids.map(String),
          [viewYear],
          ["tracts"],
        ])
        .then(() => {
          const d = (geoids || []).reduce((a, c) => {
            a.push(
              ...get(
                falcorCache,
                [
                  "dama",
                  pgEnv,
                  "tiger",
                  activeView?.view_dependencies[0],
                  c,
                  viewYear,
                  "tracts",
                  "value",
                ],
                []
              )
            );
            return a;
          }, []);
          setAcsTractGeoids(uniq([...d]));
        });
    }
    getViewData();
  }, [falcorCache, pgEnv, activeViewId, activeView, geoids, viewYear]);

  const censusConfig = useMemo(
    () =>
      (Object.keys(variablesToCensusKeys) || []).reduce((acc, cur) => {
        const temp = (variablesToCensusKeys[cur] || []).filter(Boolean);
        acc = [...acc, ...temp];
        return acc;
      }, []),
    [variablesToCensusKeys]
  );

  const divisorConfig = useMemo(
    () =>
      (Object.keys(variablesToDivisorKeys) || []).reduce((acc, cur) => {
        const temp = (variablesToDivisorKeys[cur] || []).filter(Boolean);
        acc = [...acc, ...temp];
        return acc;
      }, []),
    [variablesToDivisorKeys]
  );

  useEffect(() => {
    async function getACSData() {
      const geos = geometry === "county" ? geoids : acsTractGeoids;
      if (geos.length > 0)
        falcor.chunk([
          "acs",
          geos,
          year,
          uniq([...censusConfig, ...divisorConfig]),
        ]);
    }
    getACSData();
  }, [censusConfig, divisorConfig, year, geometry]);

  useEffect(() => {
    async function getGeoNames() {
      if (geometry === "county")
        falcor.get([
          "dama",
          [pgEnv],
          "tiger",
          activeView?.view_dependencies,
          geoids.map(String),
          [viewYear],
          ["counties"],
          "name",
        ]);
    }
    getGeoNames();
  }, [pgEnv, activeView?.view_dependencies, geoids, viewYear]);

  const tableData = useMemo(() => {
    const geos = geometry === "county" ? geoids : acsTractGeoids;
    return (geos || []).reduce((acc, geoid) => {
      let tableRow = {};

      if (geometry === "county") {
        tableRow["name"] = get(
          falcorCache,
          [
            "dama",
            pgEnv,
            "tiger",
            activeView?.view_dependencies[0],
            geoid,
            viewYear,
            "counties",
            "name",
          ],
          null
        );
      }
      (tableColumns || []).forEach((columnName) => {
        let censusVal = 0,
          divisorVal = 0,
          censusFlag = false,
          divisorFalg = false;
        (variablesToCensusKeys[columnName] || []).forEach((censusKey) => {
          const tmpVal = get(falcorCache, ["acs", geoid, year, censusKey], null);
          if (tmpVal !== null) {
            censusFlag = true;
            censusVal += tmpVal;
          }
        });

        let tempFlag = Boolean(
          variablesToDivisorKeys[columnName] && variablesToDivisorKeys[columnName].length
        );

        if (tempFlag) {
          (variablesToDivisorKeys[columnName] || []).forEach((divisorKey) => {
            if (divisorKey.length > 0) {
              const tmpVal = get(falcorCache, ["acs", geoid, year, divisorKey], null);
              if (tmpVal !== null) {
                divisorFalg = true;
                divisorVal += tmpVal;
              }
            }
          });
        }

        if (tempFlag) {
          tableRow[`${columnName}`] = divisorFalg
            ? censusVal > 0
              ? `${Math.round((censusVal / divisorVal) * 100)}%`
              : "0%"
            : null;
        } else {
          tableRow[`${columnName}`] = censusFlag ? censusVal.toLocaleString() : null;
        }
      });

      acc.push(tableRow);
      return acc;
    }, []);
  }, [
    activeViewId,
    falcorCache,
    geometry,
    tableColumns,
    year,
    variablesToCensusKeys,
  ]);

  const { data, columns } = useMemo(() => {
    const tempTableColumns = geometry === "county" ? ["name"] : [];
    return transform(tableData, [...tempTableColumns, ...tableColumns]);
  }, [tableData]);

  let tableContainerStyle = {};
  let tableContainerClassName = "";

  if (fullWidth) {
    tableContainerStyle = {
      width: "96vw",
      position: "relative",
      left: "calc(-50vw + 50%)",
    };
    tableContainerClassName = "mt-2 mx-12";
  }

  return (
    <div>
      <div className="flex">
        <TableFilter
          userHighestAuth={userHighestAuth}
          filters={filters}
          setFilters={setFilters}
          variables={variablesToCensusKeys}
          years={years}
          geometries={geometries}
          data={data}
          columns={columns}
          tableColumns={tableColumns}
          setTableColumns={setTableColumns}
        />
      </div>
      <div className={tableContainerClassName} style={tableContainerStyle}>
        <Table data={data} columns={columns} pageSize={50} striped={true}/>
      </div>
    </div>
  );
};

export default TablePage;
