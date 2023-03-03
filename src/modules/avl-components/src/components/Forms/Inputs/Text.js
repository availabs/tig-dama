import React from "react"



const Text = ({name, value, onChange, handler='text',...rest}) => (
  <input
    type='text'
    name={name}
    value={value}
    onChange={(e) => onChange(e,handler)}
    {...rest}
    className={`
      mt-1 form-input block w-full py-2 px-3 
      border border-gray-300 rounded-sm shadow-sm 
      focus:outline-none focus:shadow-outline-blue focus:border-blue-300 
      transition duration-150 ease-in-out 
      sm:text-sm sm:leading-5`
    }
  />
)


export default Text
