import { configureStore } from '@reduxjs/toolkit';
import planBuilderReducer from './slices/planBuilderSlice';
import socialCanvasReducer from './slices/socialCanvasSlice';

export const store = configureStore({
  reducer: {
    planBuilder: planBuilderReducer,
    socialCanvas: socialCanvasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'planBuilder/fetchPlanBuilder/fulfilled',
          'socialCanvas/fetchSocialCanvas/fulfilled',
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
