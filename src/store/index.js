import { Reducers, messages } from "@availabs/ams";
import { configureStore } from "@reduxjs/toolkit";

export default configureStore({
  reducer: {
    ...Reducers,
    messages,
  },
});

