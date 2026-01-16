import React, { useEffect, useMemo } from "react";
import Select, { components } from "react-select";
import { Button } from "~/modules/avl-components/src";
import download from "downloadjs"
import makeAnimated from "react-select/animated";
import { SOURCE_AUTH_CONFIG } from "~/pages/DataManager/Source/attributes";
import { FilterControlContainer } from "../../controls/FilterControlContainer";
import { MultiLevelSelect } from '~/modules/avl-map-2/src';

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
          />{" "}
          <label className="m-0 ml-2">{props.label}</label>
        </div>
      </components.Option>
    </div>
  );
};

const MultiSelect = ({
  options,
  onChange,
  value,
  selectMessage = "",
  ...props
}) => {
  const animatedComponents = makeAnimated();
  return (
    <Select
      {...props}
      options={options}
      onChange={onChange}
      value={value}
      controlShouldRenderValue={false}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      isMulti
      placeholder={"Variables"}
      components={{
        Option,
        animatedComponents,
      }}
    />
  );
};

const AcsTableTransform = (tableData, censusColumns) => {
  const columns = censusColumns?.map((c) => ({
    Header: c?.toUpperCase(),
    accessor: c,
  }));

  return {
    data: tableData,
    columns,
  };
};

const AcsTableFilter = ({
  variables,
  years,
  geometries,
  data,
  columns,
  filters,
  setFilters,
  tableColumns,
  setTableColumns,
  userHighestAuth
}) => {
  const [geometry, year] = useMemo(() => {
    return [filters?.geometry?.value || "county", filters?.year?.value || 2019];
  }, [filters]);

  const variableOptions = Object.keys(variables).map((v) => ({
    label: v,
    value: v,
  }));

  useEffect(() => {
    if (!geometry && geometries && geometries.length) {
      setFilters({
        ...filters,
        geometry: { value: geometries[0] },
      });
    }
    if (!year && years && years.length) {
      setFilters({
        ...filters,
        year: { value: years[0] },
      });
    }
  }, []);

  const downloadData = React.useCallback(() => {
    const mapped = data.map(d => {
      return columns.map(c => {
        return d[c.accessor];
      }).join(",")
    })
    mapped.unshift(columns.map(c => c.Header).join(","));
    download(mapped.join("\n"), `${geometry}_${year}.csv`, "text/csv");
  }, [data, columns]);
  return (
    <div className="flex flex-1 border-blue-100">
      <div className="w-[70%] border m-1 rounded-md">
        <FilterControlContainer 
          header="Variables:"
          input={({className}) => (
            <MultiLevelSelect
              searchable={true}
              isMulti={true}
              placeholder={`Select variables...`}
              options={variableOptions}
              value={tableColumns}
              displayAccessor={(s) => s.label}
              valueAccessor={(s) => s.value}
              onChange={(v) => setTableColumns(v)}
              zIndex={999}
            />
          )}
        />
      </div>
      <FilterControlContainer 
        header={'Year:'}
        input={({className}) => (
          <select
            className={className}
            value={year}
            onChange={(e) => {
              setFilters({
                ...filters,
                year: {
                  value: e.target.value,
                },
              });
            }}
          >
            {(years || []).map((k, i) => (
              <option key={i} className="ml-2 truncate" value={k}>
                {`${k}`}
              </option>
            ))}
          </select>
        )}
      />
      <FilterControlContainer 
        header={'Type:'}
        input={({className}) => (
          <select
            className={className}
            value={geometry}
            onChange={(e) => {
              setFilters({
                ...filters,
                geometry: {
                  value: `${e.target.value}`,
                },
              });
            }}
          >
            {geometries.map((v, i) => (
              <option key={i} className="ml-2 truncate" value={v}>
                {v?.toUpperCase()}
              </option>
            ))}
          </select>
        )}
      />
      {userHighestAuth >= SOURCE_AUTH_CONFIG['DOWNLOAD'] && <div className="px-2 ml-auto">
        <FilterControlContainer
          header={""}
          input={({ className }) => (
            <div>
            <Button themeOptions={{size:'sm', color: 'primary'}}
              onClick={ downloadData }
            >
              Download
            </Button>
            </div>
          )}
        />
      </div>}
    </div>
  );
};

export { AcsTableFilter, AcsTableTransform };
