import React from "react"

import { useSetRefs } from "../utils"
import { useTheme } from "../../wrappers/with-theme"

export default React.forwardRef(({
  large, small, className = "",
  labels = ["False", "True"],
  value, onChange,
  disabled = false, autoFocus = false, ...props }, ref) => {

  const [hasFocus, setHasFocus] = React.useState(false);

  const [thisRef, setRef] = React.useState(null);
  React.useEffect(() => {
    Boolean(thisRef) && autoFocus && thisRef.focus();
  }, [autoFocus, thisRef])

  const theme = useTheme();

  return (
    <div { ...props } onClick={ disabled ? null : e => onChange(!value) }
      onFocus={ e => setHasFocus(true && !disabled) }
      onBlur={ e => setHasFocus(false) }
      className={ `
        ${ large ?
            `${ theme.paddingLarge } ${ theme.textLarge }` :
          small ?
            `${ theme.paddingSmall } ${ theme.textSmall }` :
            `${ theme.paddingBase } ${ theme.textBase }`
        }
        ${ disabled ?
            `${ theme.inputBgDisabled } ${ theme.inputBorderDisabled }` :
          hasFocus ?
            `${ theme.inputBgFocus   } ${ theme.inputBorderFocus   }` :
            `${ theme.inputBg } ${ theme.inputBorder }`
        }
        ${ className }
      ` }
      ref={ useSetRefs(ref, setRef) }
      tabIndex={ disabled ? "-1" : "0" }>
      <div className="flex">
        <div className="flex-0">
          <Slider value={ value }/>
        </div>
        <div className="flex-1 ml-4">
          { labels[+Boolean(value)] }
        </div>
      </div>
    </div>
  )
})

const Slider = ({ value }) => {
  const theme = useTheme();

  return (
    <div className="px-1 h-full flex justify-center items-center">
      <div className="relative h-3">
        <div className={ `relative w-10 h-3 rounded-lg overflow-hidden` }>
          <div className={ `absolute top-0 w-20 h-full ${ theme.accent4 }` }
            style={ { left: value ? "100%" : "0", transition: "left 0.25s" } }/>
          <div className={ `absolute top-0 w-20 h-full ${ theme.bgInfo }` }
            style={ { right: value ? "0" : "100%", transition: "right 0.25s" } }/>
        </div>
        <div className={ `absolute h-4 w-4 rounded-lg ${ theme.booleanInputSlider || theme.accent2 }` }
          style={ {
            top: "50%", left: value ? "calc(100% - 0.625rem)" : "-0.125rem",
            transform: "translateY(-50%)", transition: "left 0.25s"
          } }/>
      </div>
    </div>
  )
}
