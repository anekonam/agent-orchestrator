import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_URLS } from '../../config/api';
import { handleApiResponse } from '../../utils/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastActivity: Date;
  capabilities: string[];
}

interface AgentsState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  agents: [
    {
      id: 'strategy-agent',
      name: 'Strategy Agent',
      description: 'Orchestrates multiple agents for comprehensive analysis',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Task Decomposition', 'Agent Coordination', 'Result Synthesis'],
    },
    {
      id: 'financial-analyst',
      name: 'Financial Analyst',
      description: 'Provides financial analysis and insights',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Financial Modeling', 'Risk Assessment', 'Performance Analysis'],
    },
    {
      id: 'market-intelligence',
      name: 'Market Intelligence',
      description: 'Market research and competitive analysis',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Market Research', 'Competitor Analysis', 'Trend Analysis'],
    },
    {
      id: 'cx-insights',
      name: 'Customer Experience Insights',
      description: 'Customer experience and satisfaction analysis',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Sentiment Analysis', 'Customer Journey Mapping', 'Feedback Analysis'],
    },
    {
      id: 'risk-analyst',
      name: 'Risk Analyst',
      description: 'Risk assessment and mitigation strategies',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Risk Modeling', 'Compliance Check', 'Threat Assessment'],
    },
    {
      id: 'compliance-analyst',
      name: 'Compliance Analyst',
      description: 'Regulatory compliance and audit support',
      status: 'active',
      lastActivity: new Date(),
      capabilities: ['Regulatory Analysis', 'Audit Support', 'Policy Review'],
    },
  ],
  isLoading: false,
  error: null,
};

export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async () => {
    const response = await fetch(API_URLS.AGENTS);
    return handleApiResponse(response);
  }
);

export const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    updateAgentStatus: (state, action: PayloadAction<{ id: string; status: Agent['status'] }>) => {
      const agent = state.agents.find(a => a.id === action.payload.id);
      if (agent) {
        agent.status = action.payload.status;
        agent.lastActivity = new Date();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch agents';
      });
  },
});

export const { updateAgentStatus } = agentsSlice.actions;