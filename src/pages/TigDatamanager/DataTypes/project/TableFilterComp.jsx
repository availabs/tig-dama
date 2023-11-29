import React from 'react'
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import download from "downloadjs"
import { Button } from "~/modules/avl-components/src"


const ProjectTableFilter = (
  { source, filters, setFilters, data }
) => {
  const projectIdFilterValue = filters["projectId"]?.value || null;
  let projectKey = source?.name?.includes("RTP") ? "rtp_id" : "tip_id";

  const [searchParams] = useSearchParams();
  const featureId = searchParams.get("featureId")

  React.useEffect(() => {
    if (!projectIdFilterValue) {
      if (featureId) {
        setFilters({
          projectId: { value: featureId },
        });
      }
    }
  }, []);

  const allProjectIds = data.map(d => d[projectKey]);

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
    <div className="flex flex-1 border-blue-100">
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Project ID: </div>
        <div className="px-2">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={projectIdFilterValue || ""}
            onChange={(e) =>
              setFilters({ projectId: { value: e.target.value } })
            }
          >
            <option className="ml-2  truncate" value={""}>
              None
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
      return filters[filterKey].value === val[projectKey];
    });
    return shouldKeep;
  });

  const columns = attributes
    .map((attr) => ({
      Header: attr,
      accessor: attr,
    }));

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