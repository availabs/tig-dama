import React from 'react'
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import download from "downloadjs"
import { Button } from "~/modules/avl-components/src"

const VARIABLE_LABELS = {
  ptype: "Project Type",
  rtp_id: "RTP ID",
  tip_id: "TIP ID",
  cost: "Cost",
  mpo: "MPO",
  county: "County",
  plan_portion: "Plan Portion",
  sponsor: "Sponsor",
  description: "Description",
  year: "Year",
};

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index && value !== "null" && value !== 0;
}

function alphaSort(a, b) {
  if (a < b) {
    return -1;
  } else if (b < a) {
    return 1;
  } else {
    return 0;
  }
}

const ProjectTableFilter = (
  { source, filters, setFilters, data }
) => {
  const projectIdFilterValue = filters["projectId"]?.value || null;
  const projectTypeFilterValue = filters["ptype"]?.value || null;
  const countyFilterValue = filters['county']?.value || null;
  const sponsorFilterValue = filters['sponsor']?.value || null;
  const descriptionFilterValue = filters['description']?.value || null;
  const costFilterValue = filters['cost']?.value || [null,null];
  const yearFilterValue = filters['year']?.value || null; //only for RTP
  const planPortionFilterValue = filters['plan_portion']?.value || null; //only for RTP
  const mpoFilterValue = filters['mpo']?.value || null; //only for TIP



  let projectKey = source?.name?.toLowerCase()?.includes("rtp") ? "rtp_id" : "tip_id";

  const [searchParams] = useSearchParams();
  const urlFeatureId = searchParams.get("featureId")

  React.useEffect(() => {
    if (!projectIdFilterValue) {
      if (urlFeatureId) {
        setFilters({
          projectId: { value: urlFeatureId },
        });
      }
    }
  }, []);

  const allProjectIds = data.map(d => d[projectKey]).filter(onlyUnique);
  const allProjectTypes = data.map(d => d['ptype']).filter(onlyUnique);
  const allCounties = data.map(d => d.county).filter(onlyUnique);
  const allSponsors = data.map(d => d.sponsor).filter(onlyUnique);
  const allYears = data.map(d => d.year).filter(onlyUnique);
  const allPlanPortions = data.map(d => d.plan_portion).filter(onlyUnique);
  const allMpo = data.map(d => d.mpo).filter(onlyUnique);

  allProjectIds.sort(alphaSort);
  allProjectTypes.sort(alphaSort);
  allCounties.sort(alphaSort);
  allSponsors.sort(alphaSort);
  allYears.sort(alphaSort);
  allPlanPortions.sort(alphaSort);
  allMpo.sort(alphaSort);

  const columns = source?.metadata?.columns;
  const downloadColumns = columns.filter((c) => c.name !== "wkb_geometry");

  const TableDataDownloader = React.useCallback(() => {
    const mapped = data.map((d) => {
      return downloadColumns
        .map((c) => {
          return d[c.name];
        })
        .join(",");
    });

    mapped.unshift(downloadColumns.map((c) => c.name).join(","));

    const csvName =
      projectKey === "rtp_id" ? "rtp_project.csv" : "tip_project.csv";
    download(mapped.join("\n"), csvName, "text/csv");
  }, [data, downloadColumns]);
    
  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pb-1">
      <div className='flex flex-none pb-2 w-48'>
        <div className="py-2 px-1 text-sm text-gray-400">{VARIABLE_LABELS[projectKey]}</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={projectIdFilterValue || ""}
            onChange={(e) =>
              setFilters({ projectId: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allProjectIds.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex flex-none pb-2 w-60'>
        <div className="py-2 px-1 text-sm text-gray-400">Project Type:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={projectTypeFilterValue || ""}
            onChange={(e) =>
              setFilters({ ptype: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allProjectTypes.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      {projectKey === "tip_id" && <div className='flex flex-none pb-2 w-48'>
        <div className="py-2 px-1 text-sm text-gray-400">MPO:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={mpoFilterValue || ""}
            onChange={(e) =>
              setFilters({ mpo: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allMpo.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>}
      {projectKey === "rtp_id" && <div className='flex flex-none pb-2 '>
        <div className="py-2 px-1 text-sm text-gray-400">Plan Portion:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={planPortionFilterValue || ""}
            onChange={(e) =>
              setFilters({ plan_portion: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allPlanPortions.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>}
      <div className='flex h-min pb-2 px-2'>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ TableDataDownloader }
        >
          Download
        </Button>
      </div>
      {projectKey === "rtp_id" && <div className='flex flex-none py-2 '>
        <div className="py-2 px-1 text-sm text-gray-400">Year:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={yearFilterValue || ""}
            onChange={(e) =>
              setFilters({ year: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allYears.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>}
      <div className='flex flex-none py-2 w-48'> 
        <div className="py-2 px-1 text-sm text-gray-400">County:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={countyFilterValue || ""}
            onChange={(e) =>
              setFilters({ county: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allCounties.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex flex-none py-2 w-48'>
        <div className="py-2 px-1 text-sm text-gray-400">Sponsor:</div>
        <div className="px-1">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={sponsorFilterValue || ""}
            onChange={(e) =>
              setFilters({ sponsor: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              --
            </option>
            {allSponsors.map((k, i) => (
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='flex flex-none py-2 w-96'>
        <div className="py-2 px-1 text-sm text-gray-400">Description</div>
        <div className="px-1">
          <input
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={descriptionFilterValue || ""}
            onChange={(e) =>
              setFilters({ description: { value: e.target.value } })
            }
          />
        </div>
      </div>
      <div className="flex flex-none pb-2 w-96">
        <div className="py-7 px-1 text-sm text-gray-400">Cost:</div>
        <div className="px-1 text-sm text-gray-400 font-bold">
          From:
          <input
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-32 bg-white mr-2 flex items-center justify-between text-sm"
            value={costFilterValue[0] || ""}
            onChange={(e) =>
              setFilters({ cost: { value: [parseFloat(e.target.value), costFilterValue[1]] } })
            }
          />
        </div>
        <div className="px-1 text-sm text-gray-400 font-bold">
          To:
          <input
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-32 bg-white mr-2 flex items-center justify-between text-sm"
            value={costFilterValue[1] || ""}
            onChange={(e) =>
              setFilters({ cost: { value: [costFilterValue[0], parseFloat(e.target.value)] } })
            }
          />
        </div>
      </div>
    </div>

  )
};

export const ProjectTableTransform = (tableData, attributes, filters, years, source) => {
  let projectKey = source?.name?.toLowerCase()?.includes("rtp") ? "rtp_id" : "tip_id";

  const valueRanges = tableData && tableData.length > 0 ? Object.keys(tableData[0]).reduce((a, c) => {
    if(!a[c]){
      a[c] = tableData.map(d => d[c]).filter(onlyUnique)
    }

    return a;
  }, {}) : {};

  const generateColumn = (columnName) => {
    let filterProperties = {};
    if(columnName !== "cost"){
      filterProperties = {
          filter: "dropdown",
          filterDomain: valueRanges[columnName],
          // filterMulti: attrProps.filterMulti === false ? false : true,
          filterPlaceholder:"Select value"
      };
    }
    
    if(columnName === "description"){
      filterProperties.filter = "text";
    }


    const column = {
      Header: VARIABLE_LABELS[columnName],
      accessor: columnName,
      id: columnName,
      ...filterProperties
    };

    if (columnName === "cost") {
      column.Cell = ({ value }) => {
        const displayValue =
          value !== "null" && value !== ""
            ? `$${parseFloat(value).toFixed(2).toLocaleString()} M`
            : "";
        return <div>{displayValue}</div>;
      };
    }

    return column;
  };



  
  const dependentColumns =
    projectKey === "rtp_id"
      ? [generateColumn("plan_portion"), generateColumn("year")]
      : [generateColumn("mpo")];
  const columns = [
    generateColumn(projectKey),
    generateColumn("ptype"),
    generateColumn("cost"),
    ...dependentColumns,
    generateColumn("county"),
    generateColumn("sponsor"),
    generateColumn("description"),
  ];

  columns.push({
    Header: "Actions",
    accessor: projectKey,
    id:"map_link",
    Cell: ({ value }) => {
      return <LinkCell feature={value} sourceId={source.source_id} />;
    },
  });


  const cleanedData = tableData.map(tRow => {
    const newRow = Object.keys(tRow).reduce((accRow, curKey) => {
      accRow[curKey] = tRow[curKey] === "null" ? "" : tRow[curKey]

      return accRow;
    }, {})

    return newRow;
  })

  return {
    data: cleanedData,
    columns: columns,
  };
}

const LinkCell = ({feature, sourceId}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variable = searchParams.get("variable");
  const { viewId } = useParams() || "";

  return (<div>
    <Link onClick={(e) => navigate(`/source/${sourceId}/map/${viewId}?variable=${variable}&featureId=${feature}`)}> Link to map </Link>
  </div>)
}


export default ProjectTableFilter