import { get } from "lodash";

const HubboundTableFilter = ({ source, filters, setFilters, data, columns }) => {
  let activeVar = useMemo(() => get(filters, "activeVar.value", ""), [filters]);
  // console.log("HubboundTableFilter", filters);

  const [searchParams] = useSearchParams();
  const searchVar = searchParams.get("variable");
  React.useEffect(() => {
    //console.log("SedMapFilter", activeVar);
    if (!activeVar) {
      if (searchVar) {
        setFilters({
          activeVar: { value: `${ searchVar }` },
        });
      }
      else {
        setFilters({
          activeVar: { value: source.type === 'tig_sed_county' ? 'tot_pop' : "totpop" },
        });
      }
    }
  }, [activeVar, setFilters, searchVar]);

  let varList = useMemo(() => {
    return source.type === 'tig_sed_county' ? sedVarsCounty : sedVars
  },[source.type])

// console.log("data, columns", data, columns, varList[activeVar].name)

  const downloadData = React.useCallback(() => {
    const mapped = data.map(d => {
      return columns.map(c => {
        return d[c.accessor];
      }).join(",")
    })
    mapped.unshift(columns.map(c => c.Header).join(","));
    download(mapped.join("\n"), `${ varList[activeVar].name }.csv`, "text/csv");
  }, [data, columns, varList, activeVar]);

  //console.log(, year,activeVar)

  return (
    <div className="flex flex-1 border-blue-100">
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Variable: </div>
        <div className="px-2">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={activeVar}
            onChange={(e) =>
              setFilters({ ...filters, activeVar: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              none
            </option>
            {Object.keys(varList).map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {varList[k].name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ downloadData }
        >
          Download
        </Button>
      </div>
    </div>
  );
};

const HubboundTableTransform = (tableData, attributes, filters, years,source) => {
  let activeVar = get(filters, "activeVar.value", "totpop");

  let updatedYears = years?.map((str) => (''+str).slice(-2));
  const columns = [
    {
      Header: "County",
      accessor: "county",
      sortBy: 'asc'
    },
  ];

  updatedYears.forEach((y, i) => {
    columns.push({
      Header: `20${y}`,
      accessor: `${activeVar}_${i}`,
      Cell: ({ value }) => Math.round(value).toLocaleString(),
    });
  });

  return {
    data: tableData,
    columns,
  };
};

export { HubboundTableFilter, HubboundTableTransform };