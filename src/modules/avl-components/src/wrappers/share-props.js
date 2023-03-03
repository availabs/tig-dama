import React from "react"

import get from "lodash.get"

export default (Component, options = {}) => {
  const {
    propsToShare = {}
  } = options;
  return ({ children, ...props }) => {
    const toShare = {};
    if (typeof propsToShare === "string") {
      const split = propsToShare.split(".");
      toShare[split.pop()] = get(props, propsToShare, propsToShare);
    }
    else if (Array.isArray(propsToShare)) {
      propsToShare.forEach(prop => {
        const split = prop.split(".");
        toShare[split.pop()] = get(props, prop, prop);
      });
    }
    else {
      for (const prop in propsToShare) {
        toShare[prop] = get(props, propsToShare[prop], propsToShare[prop]);
      }
    }
    return (
      <Component { ...props }>
        { React.Children.map(children, child => React.cloneElement(child, toShare)) }
      </Component>
    )
  }
}
