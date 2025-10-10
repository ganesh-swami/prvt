import { configureStore } from "@reduxjs/toolkit";
import planBuilderReducer from "./slices/planBuilderSlice";
import socialCanvasReducer from "./slices/socialCanvasSlice";
import problemTreeReducer from "./slices/problemTreeSlice";

export const store = configureStore({
  reducer: {
    planBuilder: planBuilderReducer,
    socialCanvas: socialCanvasReducer,
    problemTree: problemTreeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "planBuilder/fetchPlanBuilder/fulfilled",
          "socialCanvas/fetchSocialCanvas/fulfilled",
          "problemTree/fetchProblemTree/fulfilled",
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
