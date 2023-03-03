import React, { useEffect, useState, useReducer } from "react"

import * as d3brush from "d3-brush"
import * as d3selection from "d3-selection"

export * from "./color-ranges"

export const composeOptions = ({ ...options }) =>
  Object.keys(options).reduce((a, c) => {
    if (options[c]) {
      a.push(c.split("").map((c, i) => i === 0 ? c.toUpperCase() : c).join(""));
    }
    return a;
  }, []).join("")

export const useSetRefs = (...refs) => {
  return React.useCallback(node => {
    [...refs].forEach(ref => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      }
      else {
        ref.current = node;
      }
    })
  }, [refs])
}


// // WARNING: this hook will only work if the setNode is set to a DOM element, e.g. div, input, etc., not a React element!!!
// To use this with a React Functional Component, you must use Ref Forwarding: https://reactjs.org/docs/forwarding-refs.html
export const useClickOutside = handleClick => {
  const [node, setNode] = useState(null);

  useEffect(() => {
    const checkOutside = e => {
      if (node.contains(e.target)) {
        return;
      }
      (typeof handleClick === "function") && handleClick(e);
    }
    node && document.addEventListener("mousedown", checkOutside);
    return () => document.removeEventListener("mousedown", checkOutside);
  }, [node, handleClick])

  return [setNode, node];
}


const d3 = {
  ...d3brush,
  ...d3selection
}

const getInitialBrushState = type => ({
  group: null,
  brush: d3[type](),
  Brush: () => null,
  width: 0,
  height: 0,
  selection: null
})
const reducer = (state, action) => ({ ...state, ...action });

export const useBrush = (node, type = "brush") => {
  const [{
    group,
    brush,
    Brush,
    width,
    height,
    selection
  }, dispatch] = useReducer(reducer, type, getInitialBrushState);

  useEffect(() => {
    const setGroup = n => dispatch({ group: n });
    dispatch({
      Brush: React.memo(() => <g ref={ setGroup }/>)
    })
  }, []);

  useEffect(() => {
    if (node && group) {
      const brushEnd = e =>
        dispatch({ selection: group ? d3.brushSelection(group) : null });
      d3.select(group).call(brush.on("end", brushEnd, 50));
    }
    else if (width && height) {
      dispatch({ selection: null });
      dispatch({ width: 0, height: 0 });
    }
    return () => brush.on("end", null);
  }, [node, group, brush, width, height]);

  if (node) {
    const rect = node.getBoundingClientRect();
    if ((rect.width !== width) || (rect.height !== height)) {
      dispatch({ width: rect.width, height: rect.height });
      brush.extent([[0, 0], [rect.width, rect.height]]);
    }
  }
  useEffect(() => {
    if (node) {
      const rect = node.getBoundingClientRect();
      if ((rect.width !== width) || (rect.height !== height)) {
        dispatch({ width: rect.width, height: rect.height });
        brush.extent([[0, 0], [rect.width, rect.height]]);
      }
    }
  }, [node, brush, width, height]);

  return {
    Brush,
    selection,
    clearBrush: () => brush.clear(d3.select(group))
  }
}


const getRect = ref => {
  const node = ref ? ref.current : ref;
  if (!node) return { width: 0, height: 0 };
  return node.getBoundingClientRect();
}

export const useSetSize = (ref, callback) => {
  const [size, setSize] = React.useState({ width: 0, height: 0, x: 0, y: 0 });

  const doSetSize = React.useCallback(() => {
    const rect = getRect(ref),
      { width, height, x, y } = rect;
    if ((width !== size.width) || (height !== size.height)) {
      if (typeof callback === "function") {
        callback({ width, height, x, y });
      }
      setSize({ width, height, x, y });
    }
  }, [ref, size, callback]);

  React.useEffect(() => {
    window.addEventListener("resize", doSetSize);
    return () => {
      window.removeEventListener("resize", doSetSize);
    }
  }, [doSetSize]);

  React.useEffect(() => {
    doSetSize();
  });

  return size;
}


export const useAsyncSafe = func => {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return React.useCallback((...args) => {
    mounted.current && func(...args);
  }, [func]);
}
