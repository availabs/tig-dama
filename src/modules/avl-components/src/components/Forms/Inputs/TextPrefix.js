import React from "react"
import 'styles/tailwind.css';


const Text = ({name, prefix, state, onChange, handler='text',...rest}) => (
  <div>
  <div className="mt-1 flex rounded-md shadow-sm">
    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
      {prefix}
    </span>
    <input type='text'
      name={name}
      value={state[name]}
      onChange={(e) => onChange(e,handler)}
      {...rest}
      className="form-input flex-1 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm sm:leading-5" 
    />
  </div>
</div>
)


export default Text
