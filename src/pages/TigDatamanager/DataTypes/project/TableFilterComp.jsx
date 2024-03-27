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