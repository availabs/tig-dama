import React from 'react'

const InputContainer = ({classes='col-span-6', label, children}) =>(
  <div className={classes}>
    <label htmlFor="first_name" className="block text-sm font-medium leading-5 text-gray-700">{label}</label>
    {children}
  </div> 
)

export default InputContainer