import React, { useState, useEffect } from "react"

import { Button } from "../Button"
import Input from "./input"
import { ValueContainer, ValueItem } from "./parts"

import { verifyValue, hasValue } from "./utils"

export default ({ verify, id, autoFocus, ...props }) => {
  const [newValue, setValue] = useState(""),
    [buttonDisabled, setDisabled] = useState(false);

  const { value, type, disabled, ...rest } = props;

  let node = null;
  const addToArray = () => {
    const asArray = value || [];
    props.onChange([...asArray, newValue]);
    setValue("");
    node && node.focus();
  }
  const removeFromArray = v => {
    let value = Array.isArray(props.value) ? props.value : [];
    if (value.includes(v)) {
      value = value.filter(vv => vv !== v);
    }
    if (value.length === 0) {
      value = null;
    }
    props.onChange(value);
  }
  const edit = v => {
    setValue(v);
    removeFromArray(v);
    node && node.focus();
  }

  useEffect(() => {
    setDisabled(disabled ||
      !hasValue(newValue) ||
      (value || []).includes(newValue) ||
      !verifyValue(newValue, type, verify) ||
      (type === "number" && !(value || []).reduce((a, c) => a && (+c !== +newValue), true))
    );
  }, [value, newValue, verify, disabled, type])

  const onKeyDown = e => {
    if (newValue && e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
      addToArray();
    }
  }

  return (
    <div className="w-full">
      <div className="flex">
        <Input { ...rest } type={ type } className="mr-1" onKeyDown={ onKeyDown }
          value={ newValue } id={ id } onChange={ v => setValue(v) }
          disabled={ disabled } autoFocus={ autoFocus }
          placeholder={ `Type a value...`} ref={ n => { node = n; } }>
        </Input>
        <Button onClick={ e => addToArray() }
          buttonTheme="buttonInfo"
          disabled={ buttonDisabled }>
          add
        </Button>
      </div>
      { !value ? null :
        <div className="mt-1 ml-10">
          <ValueContainer className="cursor-default">
            { value.map((v, i) =>
                <ValueItem key={ v } edit={ e => edit(v) }
                  remove={ e => removeFromArray(v) }>
                  { v }
                </ValueItem>
              )
            }
          </ValueContainer>
        </div>
      }
    </div>
  )
}
