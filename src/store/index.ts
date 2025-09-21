import { configureStore } from '@reduxjs/toolkit';
import { dashboardSlice } from './slices/dashboardSlice';
import { agentsSlice } from './slices/agentsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    agents: agentsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;