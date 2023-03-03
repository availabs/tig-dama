import React from "react"



const Text = ({data,...rest}) => (
  <p {...rest}>
    {data}
  </p>
)


export default Text
