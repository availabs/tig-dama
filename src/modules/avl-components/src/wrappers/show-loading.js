import React from "react"

import { ScalableLoading } from "../components"

export default (Component, options = {}) => {
  const { position = "fixed" } = options;
  return React.forwardRef(({ children, ...props}, ref) => (
    <>
      <Component { ...props } ref={ ref }>
        { children }
        { !props.loading || (position !== "absolute") ? null :
          <LoadingComponent { ...options }/>
        }
      </Component>
      { !props.loading || (position !== "fixed") ? null :
        <LoadingComponent { ...options }/>
      }
    </>
  ))
}

const LoadingComponent = React.memo(({ color, position = "fixed", className = "", scale = 1 }) =>
  <div className={ `
    ${ position } left-0 top-0 right-0 bottom-0
    flex justify-center items-center z-50 bg-black opacity-50
    ${ className }
  ` }>
    <ScalableLoading scale={ scale } color={ color }/>
  </div>
)
