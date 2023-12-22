import React, { useState } from "react";
import { cloneDeep, set } from "lodash";
import { Input, Select } from "~/modules/avl-components/src";

const ACSVariableUpdate = (props) => {
  const [currentVariable, setCurrentVarialble] = useState(null);
  const { variables = [], setVariables } = props;

  const setAddNewVariable = () => {
    if (currentVariable) {
      const newVariable = {
        label: currentVariable,
        value: {
          name: currentVariable,
          censusKeys: "",
          divisorKeys: "",
          colorScale:"",
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

  const colorScaleOptions = ["First Item", "Second Item", "Third Item"];


  console.log("ryan testing variables component, variables:", variables)
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
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
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
                      <tr className="transition duration-300 ease-in-out " key={`${v?.value?.name}_row`}>
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
                          <select

                            type="text"
                            className="p-2 flex-1 shadow bg-grey-50 focus:bg-blue-100 border-gray-300"
                            value={(v?.value?.colorScale || '')}
                            placeholder="Ryan new box"
                            onChange={(e) => {
                                console.log("ryan testing onChange, val:", e)
                                setUpdateVariable(i, (e.target.value), "colorScale")
                              }
                            }
                          >
                            {
                              colorScaleOptions.map(scaleOption => {
                                return (
                                  <option value={scaleOption} key={`${v.value.name}_colorScale_${scaleOption}`}>
                                    {scaleOption}
                                  </option>
                                )
                              })
                            }
                          </select>
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
