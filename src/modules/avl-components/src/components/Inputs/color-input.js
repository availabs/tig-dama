import React from "react"

import { CustomPicker } from 'react-color'
import {
  Saturation,
  Hue
} from 'react-color/lib/components/common';

import deepequal from "deep-equal"

import Input from "./input"
import { useTheme } from "../../wrappers/with-theme"
import { composeOptions } from "../utils"

let id = -1;
const getInputId = () => `input-id-${ ++id }`;

const Slider = React.memo(({ small = false, large = false }) => {
  const theme = useTheme();
  return (
    <div className={ `
        ${ small ? "h-3 mt-1 w-1" : large ? "h-9 mt-3 w-3" : "h-6 mt-2 w-2" }
        rounded pointer-events-none ${ theme.accent3 }
      ` }
      style={ {
        transform: "translate(-50%, -50%)"
      } }/>
  )
})
const ColorPicker = ({ showPreview = true,
                        showInputs = true,
                        showLabels = true,
                        showHex = true, showRgb = true,
                        small = false, large = false,
                        disabled = false, autoFocus = false, ...props }) => {

  const [node, setNode] = React.useState(),
    hexId = React.useRef(getInputId()),
    rgbId = React.useRef(getInputId());

  React.useEffect(() => {
    node && autoFocus && node.focus();
  }, [node, autoFocus])

  const theme = useTheme(),
    inputTheme = theme[`input${ composeOptions({ large, small }) }`];

  return (
  	<div tabIndex={ disabled ? -1 : 0 } ref={ setNode }
      className={ `
        ${ inputTheme } w-full h-full
      `}>

      <div className={ `
          grid
          ${ small ? "gap-y-1 py-1" : large ? "gap-y-4 py-2" : "gap-y-2 py-1" }
        ` }
        style={ {
          gridTemplateRows: `auto auto${ showInputs ? " auto" : "" }`
        } }>

    		<div className={ `
            grid grid-cols-12
            ${ small ? "gap-x-1" : large ? "gap-x-4" : "gap-x-2" }
          ` }
          style={ {
            height: large ? "20rem" : small ? "10rem" : "15rem"
          } }>
          <div className={ `
              relative h-full cursor-pointer
              col-span-${ showPreview ? "9" : "12" }
            ` }>
            <Saturation { ...props }
              style={ {
                pointer: {
                  "pointerEvents": "none"
                }
              } }/>
          </div>
          { !showPreview ? null :
            <div className="col-span-3 h-full rounded"
              style={ {
                backgroundColor: props.hex
              } }/>
          }
    		</div>
        <div className={ `
            rounded cursor-pointer relative
            ${ small ? "h-2" : large ? "h-6" : "h-4" }
          ` }>
    			<Hue { ...props }
    				direction="horizontal"
    				pointer={ () => <Slider small={ small } large={ large }/> }/>
        </div>
        { !showInputs ? null :
          <div className={ `
              grid grid-cols-${ Boolean(showHex) + Boolean(showRgb) }
              ${ small ? "gap-x-1" : large ? "gap-x-4" : "gap-x-2" }
            ` }>

            { !showHex ? null :
              <div className={ !showLabels ? null :
                `${ theme.accent1 } rounded
                  ${ !showLabels ? "" :
                      small ? `px-1 pt-1 pb-0` : large ? "px-4 pt-4 pb-3" : `px-2 pt-2 pb-1`
                  }
                ` }>
                <HexInput id={ hexId.current } { ...props }
                  value={ props.hex }
                  small={ small } large={ large }
                  showLabels={ showLabels }/>
              </div>
            }

            { !showRgb ? null :
              <div className={ !showLabels ? null :
                `${ theme.accent1 } rounded
                  ${ !showLabels ? "" :
                      small ? `px-1 pt-1 pb-0` : large ? "px-4 pt-4 pb-3" : `px-2 pt-2 pb-1`
                  }
                ` }>
                <RgbInput id={ rgbId.current } { ...props }
                  value={ props.rgb }
                  small={ small } large={ large }
                  showLabels={ showLabels }/>
              </div>
            }

          </div>
        }

      </div>
  	</div>
  )
}
const WrappedColorPicker = CustomPicker(ColorPicker);

const ColorInput = ({ value, onChange, ...props }) => {
  const handleChange = React.useCallback(({ hex }) => {
    onChange(hex);
  }, [onChange]);
  return (
    <WrappedColorPicker color={ value || "" } { ...props }
      onChange={ handleChange }/>
  )
}
export default ColorInput;

const createHexInitialState = value => ({
  value: value.toUpperCase(),
  blurValue: value.toUpperCase()
})
const HexReducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "update-state":
      return {
        ...state,
        ...payload
      }
    default:
      return state;
  }
}

const TextInput = React.forwardRef(({ id, label, showLabels, ...props }, ref) => {
  return (
    <div className="flex flex-col items-center">
      <Input id={ id } ref={ ref } { ...props }/>
      { !showLabels ? null :
        <label htmlFor={ id }
          className={ `
            font-bold
            ${ props.small ? "text-sm" : props.large ? "text-lg" : "text-base" }
          ` }>
          { label }
        </label>
      }
    </div>
  )
})

const HexInput = ({ id, value, onChange, small = false, large = false, showLabels = true }) => {
  const [state, dispatch] = React.useReducer(HexReducer, value, createHexInitialState),
    input = React.useRef(null),
    prevState = React.useRef(null),
    prevValue = React.useRef(null);

  React.useEffect(() => {
    if (
      (value !== state.value) &&
      ((prevValue.current !== value) ||
        (prevState.current !== state.value)
      )
    ) {
      if (input.current === document.activeElement) {
        dispatch({
          type: "update-state",
          blurValue: value.toUpperCase()
        })
      } else {
        dispatch({
          type: "update-state",
          value: value.toUpperCase(),
          blurValue: !state.blurValue && value.toUpperCase()
        })
      }
    }
    prevState.current = state.value;
    prevValue.current = value;
  }, [value, state]);

  const handlechange = React.useCallback(value => {
    dispatch({
      type: "update-state",
      value
    });
    onChange(value);
  }, [onChange]);
  const handleBlur = React.useCallback(e => {
    if (state.blurValue) {
      dispatch({
        type: "update-state",
        value: state.blurValue,
        blurValue: null
      });
    }
  }, [state]);

  return (
    <TextInput type="text" id={ id }
      small={ small } large={ large }
      ref={ input }
      onChange={ handlechange }
      value={ state.value }
      onBlur={ handleBlur }
      showLabels={ showLabels }
      label="Hex"/>
  )
}

const createRgbInitialState = value => ({
  value: value,
  blurValue: value
})
const RgbReducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "update-state":
      return {
        ...state,
        ...payload
      }
    case "update-value":
      return {
        ...state,
        value: {
          ...state.value,
          ...payload
        }
      }
    default:
      return state;
  }
}

const RgbInput = ({ id, value, onChange, small = false, large = false, showLabels = true }) => {
  const [state, dispatch] = React.useReducer(RgbReducer, value, createRgbInitialState),
    rInput = React.useRef(null),
    gInput = React.useRef(null),
    bInput = React.useRef(null),
    prevState = React.useRef(null),
    prevValue = React.useRef(null);

  React.useEffect(() => {
    if (
      !deepequal(value, state.value) &&
      (!deepequal(prevValue.current, value) ||
        !deepequal(prevState.current, state.value)
      )
    ) {
      const inputs = [
        rInput.current,
        gInput.current,
        bInput.current
      ]
      if (inputs.includes(document.activeElement)) {
        dispatch({
          type: "update-state",
          blurValue: value
        })
      } else {
        dispatch({
          type: "update-state",
          value: value,
          blurValue: !state.blurValue && value
        })
      }
    }
    prevState.current = state.value;
    prevValue.current = value;
  }, [value, state]);

  const handlechange = React.useCallback((v, e) => {
    const k = e.target.name;
    dispatch({
      type: "update-value",
      [k]: v
    });
    onChange({ ...value, [k]: v });
  }, [value, onChange]);
  const handleBlur = React.useCallback(e => {
    if (state.blurValue) {
      dispatch({
        type: "update-state",
        value: state.blurValue,
        blurValue: null
      });
    }
  }, [state]);

  return (
    <div className={ `
      grid grid-cols-3
      ${ small ? "gap-x-1" : large ? "gap-x-4" : "gap-x-2" }
    ` }>

      <TextInput type="number" id={ `r-${ id }` } name="r"
        small={ small } large={ large }
        min={ 0 } max={ 255 }
        ref={ rInput }
        onChange={ handlechange }
        value={ state.value.r }
        onBlur={ handleBlur }
        showLabels={ showLabels }
        label="Red"/>

      <TextInput type="number" id={ `g-${ id }` } name="g"
        small={ small } large={ large }
        min={ 0 } max={ 255 }
        ref={ gInput }
        onChange={ handlechange }
        value={ state.value.g }
        onBlur={ handleBlur }
        showLabels={ showLabels }
        label="Green"/>

      <TextInput type="number" id={ `b-${ id }` } name="b"
        small={ small } large={ large }
        min={ 0 } max={ 255 }
        ref={ bInput }
        onChange={ handlechange }
        value={ state.value.b }
        onBlur={ handleBlur }
        showLabels={ showLabels }
        label="Blue"/>

    </div>
  )
}
