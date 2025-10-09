import { configureStore } from '@reduxjs/toolkit';
import planBuilderReducer from './slices/planBuilderSlice';

export const store = configureStore({
  reducer: {
    planBuilder: planBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['planBuilder/fetchPlanBuilder/fulfilled'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
