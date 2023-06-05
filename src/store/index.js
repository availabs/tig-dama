import {  } from "~/modules/avl-components/src";
import { Reducers, messages } from "@availabs/ams";
import { configureStore } from "@reduxjs/toolkit";

// import data_manager from "~/pages/DataManager/store";

export default configureStore({
  reducer: {
    // data_manager,
    ...Reducers,
    messages,
  },
});

