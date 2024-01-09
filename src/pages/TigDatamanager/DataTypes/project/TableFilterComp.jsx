import React from 'react'
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import download from "downloadjs"
import { Button } from "~/modules/avl-components/src"

const COLUMNS_TO_EXCLUDE = ['ogc_fid', 'county_fips']

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
  const yearFilterValue = filters['year']?.value || null; //only for RTP
  const mpoFilterValue = filters['mpo']?.value || null; //only for RTP
  const planPortionFilterValue = filters['plan_portion']?.value || null; //only for TIP

  let projectKey = source?.name?.includes("RTP") ? "rtp_id" : "tip_id";

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
  allYears.sort(alphaSort);
  allPlanPortions.sort(alphaSort);
  allSponsors.sort(alphaSort);
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
    <div className="flex flex-1 border-blue-100 py-1">
      <div className='flex flex-1'>
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
      <div className='flex flex-1'>
        <div className="py-2 px-1 text-sm text-gray-400">{projectKey}</div>
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
      <div className='flex flex-1'>
        <div className="px-1 text-sm text-gray-400">Project Type:</div>
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
      {projectKey === "tip_id" && <div className='flex flex-1'>
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
      {projectKey === "rtp_id" && <div className='flex flex-1'>
        <div className="px-1 text-sm text-gray-400">Plan Portion:</div>
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
      {projectKey === "rtp_id" && <div className='flex flex-1'>
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
      <div className='flex flex-1'>
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
      <div className='flex flex-1'> 
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
      <div className='flex'>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ TableDataDownloader }
        >
          Download
        </Button>
      </div>
    </div>

  )
};

export const ProjectTableTransform = (tableData, attributes, filters, years, source) => {
  let filteredData;
  let projectKey = source?.name?.includes("RTP") ? "rtp_id" : "tip_id";

  const activeFilterKeys = Object.keys(filters).filter(
    (filterKey) => !!filters[filterKey].value
  );

  filteredData = tableData.filter((val) => {
    const shouldKeep = activeFilterKeys.every((filterKey) => {
      if(filterKey === "description"){
        return val[filterKey].toLowerCase().includes(filters[filterKey].value.toLowerCase());
      }
      else{
        const dataAccessor = filterKey === 'projectId' ? projectKey : filterKey;
        return filters[filterKey].value === val[dataAccessor];
      }
    });
    return shouldKeep;
  });

  const columns = attributes.filter(attr => !COLUMNS_TO_EXCLUDE.includes(attr)).map((attr) => {
    if (attr === "cost") {
      return {
        Header: attr,
        accessor: attr,
        id: attr,
        Cell: ({ value }) => {
          const displayValue = value !== "null" ? `$${parseInt(value).toFixed(2).toLocaleString()}` : "--"
          return <div>{displayValue}</div>;
        },
      };
    } else {
      return { Header: attr, accessor: attr, id: attr };
    }
  });

  columns.push({
    Header: "Actions",
    accessor: projectKey,
    id:"map_link",
    Cell: ({ value }) => {
      return <LinkCell feature={value} sourceId={source.source_id} />;
    },
  });

  return {
    data: filteredData,
    columns: columns,
  };
}

const LinkCell = ({feature, sourceId}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const variable = searchParams.get("variable")

  return (<div>
    <Link onClick={(e) => navigate(`/source/${sourceId}/map?variable=${variable}&featureId=${feature}`)}> Link to map </Link>
  </div>)
}


export default ProjectTableFilter