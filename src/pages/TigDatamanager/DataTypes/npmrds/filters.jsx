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
            />
          );
        })}
    </div>
  );
};


const FilterInput = ({ attribute, name, value, setFilters, filters }) => {
  const { values, optionComp, type } = attribute;
  const inputValue = type === "range" ? value[0] : value;
  const displayName = attribute.displayName ?? name.split("_").join(" ")

  const OptionComp = optionComp ?? DefaultOptionComp;

  return (
    <div className="flex justify-start content-center flex-wrap">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        {displayName}:
      </div>
      <div className="flex">
        <select
          className="w-full bg-blue-100 rounded mr-2 px-1 flex text-sm capitalize"
          value={inputValue}
          onChange={(e) =>
            setFilters({
              ...filters,
              [name]: { value: e.target.value },
            })
          }
        >
          {values?.map((k, i) => (
            <OptionComp key={i} val={k}/>
          ))}
        </select>
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
