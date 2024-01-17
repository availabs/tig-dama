import React, { useState } from "react";
import { cloneDeep, set } from "lodash";
import {
  Input,
  Select,
  ColorRanges,
  ColorBar,
  getColorRange,
} from "~/modules/avl-components/src";

const DEFAULT_COLOR_SCALE = getColorRange(5, "YlOrRd", false);

const areColorScalesEqual = (scaleOne, scaleTwo) => {
  if (
    !scaleOne ||
    !scaleTwo ||
    scaleOne.length === 0 ||
    scaleTwo.length === 0
  ) {
    return false;
  }
  for (let i = 0; i < scaleOne?.length; i++) {
    if (scaleOne[i] !== scaleTwo[i]) {
      return false;
    }
  }

  return true;
}

const ColorSchemeOption = ({ colorScheme, isActiveOption }) => {
  const optionStyle = isActiveOption ? { backgroundColor: "chartreuse" } : {};

  return (
    <div className="p-3" style={optionStyle}>
      <ColorBar colors={colorScheme.colors} size={8}/>
    </div>
  );
};


const ACSVariableUpdate = (props) => {
  const [currentVariable, setCurrentVarialble] = useState(null);
  const { variables = [], setVariables } = props;

  const colorSchemeOptions = ColorRanges[5].filter(colorScheme => colorScheme.type === 'Sequential');

  const emptyColorOption = (
    <div className={`flex`} value={""}>
      <span className={`flex`}>None Selected</span>
    </div>
  );

  const setAddNewVariable = () => {
    if (currentVariable) {
      const newVariable = {
        label: currentVariable,
        value: {
          name: currentVariable,
          censusKeys: "",
          divisorKeys: "",
          colorScale:colorSchemeOptions[0].colors,
        },
      };
      const tempVars = [...variables, newVariable];
      setVariables(tempVars);
      setCurrentVarialble(null);
    }
  };

  const setDeleteColumn = (ind) => {
    variables?.splice(ind, 1);
    setVariables(cloneDeep(variables));
  };

  const setUpdateVariable = (index, value, key) => {
    set(variables[index], `value.${key}`, value);
    setVariables(cloneDeep(variables));
  };

  return (
    <>
      <Input
        type="text"
        className="p-2 mx-2 flex-1 shadow bg-grey-50 focus:bg-blue-100 border-gray-300 "
        value={currentVariable}
        placeholder="Type a variable name"
        onChange={(val) => setCurrentVarialble(val)}
      />
      <button
        onClick={() => setAddNewVariable()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4"
      >
        Add a new Variable{" "}
      </button>
      <div className="flex flex-col px-5 mx-3">
        <div className="sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div>
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium ">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Census Keys
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Divisor Keys
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Color scale
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variables && variables.length > 0 ? (
                    variables.map((v, i) => (
                      <tr
                        className="transition duration-300 ease-in-out "
                        key={`${v?.value?.name}_row`}
                      >
                        <td className="whitespace-nowrap  px-6 py-4 font-medium">
                          {v?.value?.name || ""}
                        </td>
                        <td className="whitespace-nowrap  px-6 py-4">
                          <Input
                            type="text"
                            className="p-2  flex-1 shadow bg-grey-50 focus:bg-blue-100 border-gray-300"
                            value={(v?.value?.censusKeys || []).join(",") || ""}
                            placeholder="Enter Census Keys"
                            onChange={(val) =>
                              setUpdateVariable(i, (val || "").split(","), "censusKeys")
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Input
                            type="text"
                            className="p-2 flex-1 shadow bg-grey-50 focus:bg-blue-100 border-gray-300"
                            value={(v?.value?.divisorKeys || []).join(",") || ""}
                            placeholder="Enter Divisor Keys"
                            onChange={(val) =>
                              setUpdateVariable(i, (val || "").split(","), "divisorKeys")
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <ColorSchemeOption
                            colorScheme={{colors:v.value?.colorScale || DEFAULT_COLOR_SCALE}}
                            key={`${v?.value?.name}_colorScale_${JSON.stringify(v.value.colorScale)}`}
                          />
                          <Select
                            placeholder={"Select a scale:"}
                            value={v?.value?.colorScale || ""}
                            onChange={(e) => {
                              setUpdateVariable(i, e.props.colorScheme.colors, "colorScale");
                            }}
                            options={colorSchemeOptions.map((colorScheme) => (
                              <ColorSchemeOption
                                isActiveOption={areColorScalesEqual(
                                  v.value.colorScale,
                                  colorScheme.colors
                                )}
                                colorScheme={colorScheme}
                                key={`${v?.value?.name}_colorScale_${JSON.stringify(colorScheme.colors)}`}
                              />
                            ))}
                          />
                        </td>
                        <td className="whitespace-nowrap">
                          <div
                            onClick={() => setDeleteColumn(i)}
                            className="mx-3 my-2 text-red-200 hover:text-red-400 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center "
                          >
                            <span className=" cursor-pointer">
                              <i className="fa fa-trash" />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b transition duration-300 ease-in-out ">
                      <td>No Variables Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ACSVariableUpdate;
