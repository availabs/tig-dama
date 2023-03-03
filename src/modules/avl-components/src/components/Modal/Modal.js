import React from "react"
import { useTheme } from "../../wrappers/with-theme"

export default  ({children, open, themeOptions}) =>{
  const theme = useTheme()['modal'](themeOptions);
  return  (
    <div style={{display: open ? 'flex' : 'none',} } className={`${theme.modalContainer}`}>
      <div className={`${theme.modalOverlay}`} />
      <div className={`${theme.modal}`}> 
        {children}
      </div>
    </div>
  )
}