import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  selectedAgent: string | null;
  isLoading: boolean;
  error: string | null;
  messages: Array<{
    id: string;
    agent: string;
    content: string;
    timestamp: Date;
    type: 'query' | 'response' | 'error';
  }>;
}

const initialState: DashboardState = {
  selectedAgent: null,
  isLoading: false,
  error: null,
  messages: [],
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedAgent: (state, action: PayloadAction<string | null>) => {
      state.selectedAgent = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state, action: PayloadAction<Omit<DashboardState['messages'][0], 'id' | 'timestamp'>>) => {
      state.messages.push({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setSelectedAgent, setLoading, setError, addMessage, clearMessages } = dashboardSlice.actions;