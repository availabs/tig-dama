import React, {
  useEffect,
} from "react";
import ReactSlider from 'react-slider';

import { HUBBOUND_ATTRIBUTES } from "../constants";

const SLIDER_TRACK_CLASSNAME = " track"
const INACTIVE_TRACK_CLASSNAME = " bg-gray-100";
const ACTIVE_TRACK_CLASSNAME = " bg-blue-700"
//`count` is excluded because API endpoint currently does not support `<` or `>` operations
const HubboundFilters = ({ filters, setFilters, filterType = "mapFilter" }) => {
  const year =  filters?.year?.value;

  useEffect(() => {
    const newFilters = {...filters};
    if (!year) {
      newFilters.year = { value: 2019 }
    }    
    setFilters(newFilters)
  }, []);

  return (
    <div className="flex flex-wrap flex-1 border-blue-100 pb-1 justify-start gap-y-2">
      {Object.keys(HUBBOUND_ATTRIBUTES).filter(attrKey => HUBBOUND_ATTRIBUTES[attrKey][filterType]).map(attrName => {
        return <FilterInput key={`filter_input_${attrName}`} setFilters={setFilters} filters={filters} name={attrName} attribute={HUBBOUND_ATTRIBUTES[attrName]} value={filters[attrName]?.value || ""}/>
      })}
    </div>
  );
};

const FilterInput = ({ attribute, name, value, setFilters, filters }) => {
  const { values, type } = attribute;
  const inputValue = type === "range" ? value[0] : value;
  return (
    <div className="flex justify-start content-center flex-wrap">
      <div className="flex py-3.5 px-2 text-sm text-gray-400 capitalize">
        {name.split("_").join(" ")}:
      </div>
      { type !== "range" && (
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
              <option key={i} className="ml-2  truncate" value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      )}
      { type === "range" && (
        <div className="grid p-2 mx-2">
          <div className="flex">
            <ReactSlider
                className="w-64 h-8 mt-2 self-center"
                thumbClassName="bg-gray-100 self-center rounded-lg border border-black w-3 h-3"
                trackClassName={`h-3 self-center rounded  border border-blue-300 ${SLIDER_TRACK_CLASSNAME}`}
                markClassName="bg-blue-500 w-px h-1 mt-3 ml-1 text-xs"
                thumbActiveClassName="bg-gray-300"
                marks={true}
                min={values[0]}
                max={values[values.length-1]}
                pearling
                renderMark={(props) => {return <span {...props} >{props.key % 4 === 3 ? props.key : ''}</span>}}
                value={filters?.[name]?.value}
                onAfterChange={(value, thumbIndex) => {
                  setFilters({
                    ...filters,
                    [name]: { value },
                  })
                }}
                renderTrack={(props, state) => {
                  let { className, key } = props;
                  if (key.includes(`${SLIDER_TRACK_CLASSNAME}-0`) || key.includes(`${SLIDER_TRACK_CLASSNAME}-2`)) {
                    className += INACTIVE_TRACK_CLASSNAME;
                    key += INACTIVE_TRACK_CLASSNAME;
                  }
                  else {
                    className += ACTIVE_TRACK_CLASSNAME;
                    key += ACTIVE_TRACK_CLASSNAME;
                  }
                  const newProps = { ...props, className, key };
                  return <div { ...newProps } />
                }}

            />

          </div>
          <div className="flex justify-self-center text-sm">From: {value[0]} To: {value[1]}</div>
        </div>
      )}
    </div>
  );
};

export { HubboundFilters };