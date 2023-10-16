import React, {useMemo} from 'react'
import download from "downloadjs"
import { Button } from "~/modules/avl-components/src"


const ProjectTableFilter = (
    source,
    filters,
    setFilters,
) => {
    const data = source?.data;
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
      <div className='flex flex-1'>
        <Button themeOptions={{size:'sm', color: 'primary'}}
          onClick={ TableDataDownloader }
        >
          Download
        </Button>
      </div>
    )
};


export default ProjectTableFilter