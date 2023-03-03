import React from 'react'
// import TrackVisibility from 'react-on-screen';
// import CensusCharts from 'components/CensusCharts'
import ComponentLibraryBase from "./components/ComponentLibrary"
import { Wrappers } from "./wrappers"

import get from "lodash.get"

let ComponentLibrary = {
  ...ComponentLibraryBase
}

let WrapperLibrary = {
  ...Wrappers
}

export const addComponents = comps => {
  ComponentLibrary = {
    ...ComponentLibrary,
    ...comps
  }
}
export const addWrappers = wraps => {
  WrapperLibrary = {
    ...WrapperLibrary,
    ...wraps
  }
}

const getKey = (config, i) => get(config, "key", `key-${ i.join("-") }`);

const getFragment = comp =>
  ({ children }) =>
    <React.Fragment>
      { comp }
      { children }
    </React.Fragment>

const getBasicJSX = config => ({ children, ...props }) =>
  <config.type { ...props }>
    { children }
  </config.type>

const getComponent = config =>
  React.isValidElement(config) ? getFragment(config) :
  typeof config === "function" ? config :
  typeof config === "string" ? getFragment(config) :
  typeof config.type === "function" ? config.type :
  typeof config.type === "object" ? config.type :
  get(ComponentLibrary, config.type, getBasicJSX(config))

const applyWrappers = (Component, config) => {
  return get(config, "wrappers", [])
    .reduce((a, c) => {
      if (typeof c === "string") {
        return get(WrapperLibrary, c, d => d)(a);
      }
      else if (typeof c === "function") {
        return c(a);
      }
      else if (typeof c === "object") {
        const { type, options } = c;
        return get(WrapperLibrary, type, d => d)(a, options);
      }
      return a;
    }, Component);
}

const processConfig = (config, i = [0], outerConfig = {}) => {
  let Component = getComponent(config);
  if (typeof Component === "object") {
    return processConfig(Component, i, config);
  }
  Component = applyWrappers(applyWrappers(Component, outerConfig), config);

  const children = [
    ...get(outerConfig, "children", []),
    ...get(config, "children", [])
  ];

  return (
    <Component key={ getKey(config, i) }
      { ...get(config, "props", {}) }
      { ...get(outerConfig, "props", {}) }>
      { children.map((child, ii) => processConfig(child, [...i, ii])) }
    </Component>
  );
}

export const ComponentFactory = ({ config }) => {
  return processConfig(config);
}
