import { configureStore } from "@reduxjs/toolkit";
import busesReducer from "./sllices/busesSlice";
// import companiesReducer from "./slices/companiesSlice";
// import userReducer from "./slices/userSlice";
// import ticketsReducer from "./slices/ticketsSlice";

const store = configureStore({
  reducer: {
    buses: busesReducer,
    // companies: companiesReducer,
    // user: userReducer,
    // tickets: ticketsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check
    }),
});

export default store;
