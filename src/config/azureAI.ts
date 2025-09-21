// Azure AI Projects configuration for the FAB Agents Dashboard
// Based on Azure AI Foundry Projects API pattern
export interface AzureAIProjectsConfig {
  projectEndpoint: string;
  apiKey: string;
  apiVersion: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AzureAIAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  isDefault?: boolean;
}

// Azure AI Projects configuration
export const AZURE_AI_CONFIG: AzureAIProjectsConfig = {
  projectEndpoint: process.env.REACT_APP_AZURE_AI_ENDPOINT || 'https://your-ai-foundry.services.ai.azure.com/api/projects/YOUR_PROJECT',
  apiKey: process.env.REACT_APP_AZURE_AI_API_KEY || '',
  apiVersion: process.env.REACT_APP_AZURE_AI_API_VERSION || '2024-02-15-preview',
  maxTokens: parseInt(process.env.REACT_APP_AZURE_AI_MAX_TOKENS || '4000'),
  temperature: parseFloat(process.env.REACT_APP_AZURE_AI_TEMPERATURE || '0.7'),
  timeout: parseInt(process.env.REACT_APP_AZURE_AI_TIMEOUT || '30000'), // 30 seconds
};

// Agent IDs from environment variables
export const AGENT_IDS = {
  STRATEGY: process.env.REACT_APP_AZURE_AI_STRATEGY_AGENT_ID || 'asst_PGupLZwh01ZI3GqfDxX0DsZn',
  DEFAULT: process.env.REACT_APP_AZURE_AI_DEFAULT_AGENT_ID || 'asst_PGupLZwh01ZI3GqfDxX0DsZn',
};

// Available Azure AI agents configuration
export const AZURE_AI_AGENTS: AzureAIAgent[] = [
  {
    id: AGENT_IDS.STRATEGY,
    name: 'Strategy Agent',
    description: 'Strategic planning, business development, and organizational insights',
    capabilities: ['strategic_planning', 'business_analysis', 'organizational_development', 'market_analysis'],
    isDefault: true,
  },
  {
    id: AGENT_IDS.DEFAULT,
    name: 'General Business Agent',
    description: 'General business analysis and insights across multiple domains',
    capabilities: ['financial_analysis', 'market_research', 'risk_assessment', 'compliance_analysis'],
  },
];

// Helper functions
export const getDefaultAgent = (): AzureAIAgent => {
  return AZURE_AI_AGENTS.find(agent => agent.isDefault) || AZURE_AI_AGENTS[0];
};

export const getAgentById = (id: string): AzureAIAgent | undefined => {
  return AZURE_AI_AGENTS.find(agent => agent.id === id);
};

export const getAgentByCapability = (capability: string): AzureAIAgent[] => {
  return AZURE_AI_AGENTS.filter(agent => agent.capabilities.includes(capability));
};

// Validation function
export const validateAzureAIConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!AZURE_AI_CONFIG.projectEndpoint) {
    errors.push('Azure AI Projects endpoint is required');
  }

  if (!AZURE_AI_CONFIG.apiKey) {
    errors.push('Azure AI Projects API key is required');
  }

  if (!AGENT_IDS.DEFAULT) {
    errors.push('Default agent ID is required');
  }

  if (AZURE_AI_CONFIG.maxTokens <= 0) {
    errors.push('Max tokens must be greater than 0');
  }

  if (AZURE_AI_CONFIG.temperature < 0 || AZURE_AI_CONFIG.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Debug helper
export const logAzureAIConfig = () => {
  if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
    console.log('🔧 Azure AI Projects Configuration:', {
      projectEndpoint: AZURE_AI_CONFIG.projectEndpoint,
      apiVersion: AZURE_AI_CONFIG.apiVersion,
      maxTokens: AZURE_AI_CONFIG.maxTokens,
      temperature: AZURE_AI_CONFIG.temperature,
      timeout: AZURE_AI_CONFIG.timeout,
      agentIds: AGENT_IDS,
      availableAgents: AZURE_AI_AGENTS.map(agent => ({
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
      })),
    });
  }
};
