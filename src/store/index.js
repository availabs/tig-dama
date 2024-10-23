import { Reducers, messages } from "~/modules/ams/src";
import { configureStore } from "@reduxjs/toolkit";

export default configureStore({
  reducer: {
    ...Reducers,
    messages,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
});