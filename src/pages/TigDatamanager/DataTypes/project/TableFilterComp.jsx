import React, {useMemo} from 'react'
import { useSearchParams } from "react-router-dom";
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
  allProjectIds.unshift("");

  const columns = source?.columns;

  const TableDataDownloader = React.useCallback(() => {
    const mapped = data.map(d => {
      return columns.map(c => {
        return d[c.accessor];
      }).join(";")
    })

    mapped.unshift(columns.map(c => c.Header).join(";"));
    download(mapped.join("\n"), `Tip_project.csv`, "text/csv");
  }, [data, columns]);
    
  return (
    <div className="flex flex-1 border-blue-100">
      <div className='flex flex-1'>
        <div className='flex-1' /> 
        <div className="py-3.5 px-2 text-sm text-gray-400">Project ID: </div>
        <div className="px-2">
          <select
            className="pl-3 pr-4 py-2.5 border border-blue-100 bg-blue-50 w-full bg-white mr-2 flex items-center justify-between text-sm"
            value={projectIdFilterValue}
            onChange={(e) =>
              setFilters({ projectId: { value: e.target.value } })
            }
          >
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

export const ProjectTableTransform = (tableData, attributes, filters, years,source) => {
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

  const columns = attributes.map(attr => {
    return {
      Header: attr,
      accessor: attr
    }
  });

  columns.push({Header: 'Actions', accessor: "link", Cell: (d) => <div>Map link coming soon</div>})

  return {
    data: filteredData,
    columns: columns,
  };
}


export default ProjectTableFilter