import React from "react"

import Input from "./input"
import { Button } from "../Button"
import {
  ValueContainer, ValueItem
} from "./parts"

export default ({ value = {}, id, onChange, disabled, autoFocus,
  large, small, ...props }) => {
  const [key, setKey] = React.useState(""),
    [keyValue, setKeyValue] = React.useState("");

  let node = null;

  const addToObject = () => {
    onChange({ ...value, [key]: keyValue });
    setKey("");
    setKeyValue("");
    node && node.focus();
  }
  const onKeyDown = e => {
    if (key && keyValue && e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
      addToObject();
    }
  }
  const remove = k => {
    delete value[k];
    onChange({ ...value });
  }
  const edit = k => {
    setKey(k);
    setKeyValue(value[k]);
    remove(k);
    node && node.focus();
  }
  const numKeys = Object.keys(value).length;

  return (
    <div>
      <div className="flex">
        <Input className="flex-1" value={ key } onChange={ setKey }
          id={ id } autoFocus={ autoFocus } ref={ n => node = n }
          disabled={ disabled } onKeyDown={ onKeyDown }
          large={ large } small={ small }/>
        <Input className="flex-1 ml-1" value={ keyValue } onKeyDown={ onKeyDown }
          onChange={ setKeyValue } disabled={ disabled }
          large={ large } small={ small }/>
        <Button className="flex-0 ml-1" onClick={ addToObject }
          disabled={ disabled || !key || !keyValue || (key in value) }
          large={ large } small={ small }>
          Add to Object
        </Button>
      </div>
      { !numKeys ? null :
        <div className="mt-1 ml-10">
          <ValueContainer className="cursor-default">
            <ValueItem>{ "{" }</ValueItem>
            { Object.keys(value).map((k, i) =>
                <ValueItem key={ k } edit={ e => edit(k) }
                  remove={ e => remove(k) }>
                  { k }: { value[k] }
                </ValueItem>
              )
            }
            <ValueItem>{ "}" }</ValueItem>
          </ValueContainer>
        </div>
      }
    </div>
  )
}
