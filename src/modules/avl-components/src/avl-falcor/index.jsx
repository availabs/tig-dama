import React from "react"

import debounce from "lodash/debounce"

export * from "./falcorGraph"

const FalcorContext = React.createContext();

export const useFalcor = () => React.useContext(FalcorContext);

export const FalcorConsumer = FalcorContext.Consumer;

export const FalcorProvider = ({ falcor, children }) => {
  const [falcorCache, setFalcorCache] = React.useState({});

  const updateCache = React.useMemo(() =>
    debounce(() => {
      const cache = falcor.getCache();
      setFalcorCache(cache);
    }, 250)
  , [falcor]);

  React.useEffect(() => {
    falcor.onChange(updateCache);
    return () => {
      falcor.remove(updateCache);
    }
  }, [falcor, updateCache]);

  const falcorValue = React.useMemo(() =>
    ({ falcor, falcorCache })
  , [falcor, falcorCache]);

  return (
    <FalcorContext.Provider value={ falcorValue }>
      { children }
    </FalcorContext.Provider>
  )
}

const NO_MAP = () => ({});
const NO_OP = () => {};
export const avlFalcor = (Component, options = {}) => {
  const {
    mapCacheToProps = NO_MAP
  } = options
  return props => {
    const [ref, setRef] = React.useState();

    const { falcor, falcorCache } = useFalcor();

    React.useEffect(() => {
      if (!ref) return;
      if (typeof ref.fetchFalcorDeps !== "function") return;
      ref.fetchFalcorDeps(falcorCache).then(NO_OP);
    }, [ref, falcorCache]);

    return (
      <Component { ...props } ref={ setRef }
        falcor={ falcor } falcorCache={ falcorCache }
        { ...mapCacheToProps(falcorCache, props) }
      />
    )
  }
}
