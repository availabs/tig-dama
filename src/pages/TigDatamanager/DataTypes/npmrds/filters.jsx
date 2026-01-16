import { MultiLevelSelect } from '~/modules/avl-map-2/src';
import { FilterControlContainer } from "../controls/FilterControlContainer";

export const NpmrdsFilters = ({filterSettings, filterType, filters, setFilters}) => {
  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pt-1 pb-1 justify-start gap-y-2">
      {Object.keys(filterSettings)
        .filter((attrKey) => filterSettings[attrKey][filterType])
        .map((attrName) => {
          return (
            <FilterInput
              key={`filter_input_${attrName}`}
              setFilters={setFilters}
              filters={filters}
              name={attrName}
              attribute={filterSettings[attrName]}
              value={filters[attrName]?.value || ""}
              inputType={filterSettings[attrName].inputType ?? "default"}
            />
          );
        })}
    </div>
  );
};

const MultiInputContainer = ({  children }) => {
  return (
    <div className={ `p-4 border bg-blue-100`}>
      { children }
    </div>
  )
}

const FilterInput = ({ attribute, name, value, setFilters, filters, inputType }) => {
  const { values, optionComp, type } = attribute;
  const inputValue = type === "range" ? value[0] : value;
  const displayName = attribute.displayName ?? name.split("_").join(" ")

  const OptionComp = optionComp ?? DefaultOptionComp;
  let inputComp;
  if(inputType === "multi") {
    inputComp = (
      <FilterControlContainer 
        header={''}
        input={({className}) => (
          <div className="border m-1 rounded-md">
            <MultiLevelSelect
              placeholder="Select TMC to zoom"
              searchable={true}
              isMulti={false}
              options={values}
              // displayAccessor={(s) =>
              //   geomKeyName === "taz"
              //     ? `TAZ ${s.taz} -- ${s.county} County`
              //     : `${s.county} County`
              // }
              // valueAccessor={(s) => (geomKeyName === "taz" ? s.taz : s.county)}
              value={value || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    [name]: { value: e },
                  })
                }
              zIndex={999}
            />
          </div>
        )}
      />
    );
  } else {
 
    inputComp = (
           <FilterControlContainer 
              header={displayName}
              input={({className}) => (
                <select
                  className={className}
                  value={inputValue}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      [name]: { value: e.target.value },
                    })
                  }
                >
                  {values?.map((k, i) => (
                    <OptionComp key={i} val={k} />
                  ))}
                </select>
              )}
            />
    );
  }

  return (
    <div className="flex justify-start content-center flex-wrap">
      <div className="flex">
        {inputComp}
      </div>
    </div>
  );
};

const DefaultOptionComp = ({ val }) => {
  return (
    <option className="ml-2  truncate" value={val}>
      {val}
    </option>
  );
};
