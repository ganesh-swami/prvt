import { configureStore } from "@reduxjs/toolkit";
import planBuilderReducer from "./slices/planBuilderSlice";
import socialCanvasReducer from "./slices/socialCanvasSlice";
import problemTreeReducer from "./slices/problemTreeSlice";
import ecosystemMapReducer from "./slices/stakeholdersSlice";
import marketSizingReducer from "./slices/marketSizingSlice";
import pricingLabReducer from "./slices/pricingLabSlice";
import unitEconomicsReducer from "./slices/unitEconomicsSlice";

export const store = configureStore({
  reducer: {
    planBuilder: planBuilderReducer,
    socialCanvas: socialCanvasReducer,
    problemTree: problemTreeReducer,
    ecosystemMap: ecosystemMapReducer,
    marketSizing: marketSizingReducer,
    pricingLab: pricingLabReducer,
    unitEconomics: unitEconomicsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "planBuilder/fetchPlanBuilder/fulfilled",
          "socialCanvas/fetchSocialCanvas/fulfilled",
          "problemTree/fetchProblemTree/fulfilled",
          "ecosystemMap/fetchStakeholders/fulfilled",
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
