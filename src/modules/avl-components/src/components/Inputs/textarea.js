import React from "react"

import { composeOptions } from "../utils"
import { useTheme } from "../../wrappers/with-theme"

export default React.forwardRef(({ large, small, className = "", children, onChange, value, ...props }, ref) => {
  const theme = useTheme(),
    inputTheme = theme[`input${ composeOptions({ large, small }) }`];
  return (
    <textarea { ...props } onChange={ e => onChange(e.target.value) } value={ value || "" }
      className={ `${ inputTheme } ${ className }` } ref={ ref } rows={ 6 }>
      { children }
    </textarea>
  )
})
