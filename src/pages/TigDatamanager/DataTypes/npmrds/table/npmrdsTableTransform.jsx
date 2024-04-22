import {useEffect,useContext} from "react";
import { DamaContext } from "~/pages/DataManager/store";
const npmrdsTableTransform = (tableData, attributes, filters, setFilters) => {
  const { pgEnv, falcor, falcorCache } = useContext(DamaContext);
  



  console.log("in NPMRDS table transform")
  return {
    data: [],
    columns: []
  };
};

export { npmrdsTableTransform };
