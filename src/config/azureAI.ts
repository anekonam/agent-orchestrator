// Azure AI Foundry configuration for the FAB Agents Dashboard
export interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  apiVersion: string;
  deploymentName: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AzureAIAgent {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  capabilities: string[];
  isDefault?: boolean;
}

// Azure AI Foundry configuration
export const AZURE_AI_CONFIG: AzureAIConfig = {
  endpoint: process.env.REACT_APP_AZURE_AI_ENDPOINT || 'https://your-azure-ai-endpoint.openai.azure.com',
  apiKey: process.env.REACT_APP_AZURE_AI_API_KEY || '',
  apiVersion: process.env.REACT_APP_AZURE_AI_API_VERSION || '2024-02-15-preview',
  deploymentName: process.env.REACT_APP_AZURE_AI_DEPLOYMENT_NAME || 'gpt-4',
  maxTokens: parseInt(process.env.REACT_APP_AZURE_AI_MAX_TOKENS || '4000'),
  temperature: parseFloat(process.env.REACT_APP_AZURE_AI_TEMPERATURE || '0.7'),
  timeout: parseInt(process.env.REACT_APP_AZURE_AI_TIMEOUT || '30000'), // 30 seconds
};

// Available Azure AI agents configuration
export const AZURE_AI_AGENTS: AzureAIAgent[] = [
  {
    id: 'financial-analyst',
    name: 'Financial Analyst Agent',
    description: 'Specialized in financial analysis, market trends, and investment insights',
    endpoint: `${AZURE_AI_CONFIG.endpoint}/openai/deployments/${AZURE_AI_CONFIG.deploymentName}/chat/completions`,
    capabilities: ['financial_analysis', 'market_research', 'risk_assessment'],
    isDefault: true,
  },
  {
    id: 'compliance-analyst',
    name: 'Compliance Analyst Agent',
    description: 'Expert in regulatory compliance, risk management, and policy analysis',
    endpoint: `${AZURE_AI_CONFIG.endpoint}/openai/deployments/${AZURE_AI_CONFIG.deploymentName}/chat/completions`,
    capabilities: ['compliance_analysis', 'regulatory_review', 'policy_assessment'],
  },
  {
    id: 'market-intelligence',
    name: 'Market Intelligence Agent',
    description: 'Provides market insights, competitive analysis, and industry trends',
    endpoint: `${AZURE_AI_CONFIG.endpoint}/openai/deployments/${AZURE_AI_CONFIG.deploymentName}/chat/completions`,
    capabilities: ['market_analysis', 'competitive_intelligence', 'trend_analysis'],
  },
  {
    id: 'risk-analyst',
    name: 'Risk Analyst Agent',
    description: 'Specializes in risk assessment, threat analysis, and mitigation strategies',
    endpoint: `${AZURE_AI_CONFIG.endpoint}/openai/deployments/${AZURE_AI_CONFIG.deploymentName}/chat/completions`,
    capabilities: ['risk_assessment', 'threat_analysis', 'mitigation_planning'],
  },
  {
    id: 'strategy-agent',
    name: 'Strategy Agent',
    description: 'Strategic planning, business development, and organizational insights',
    endpoint: `${AZURE_AI_CONFIG.endpoint}/openai/deployments/${AZURE_AI_CONFIG.deploymentName}/chat/completions`,
    capabilities: ['strategic_planning', 'business_analysis', 'organizational_development'],
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

  if (!AZURE_AI_CONFIG.endpoint) {
    errors.push('Azure AI endpoint is required');
  }

  if (!AZURE_AI_CONFIG.apiKey) {
    errors.push('Azure AI API key is required');
  }

  if (!AZURE_AI_CONFIG.deploymentName) {
    errors.push('Azure AI deployment name is required');
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
    console.log('🔧 Azure AI Configuration:', {
      endpoint: AZURE_AI_CONFIG.endpoint,
      apiVersion: AZURE_AI_CONFIG.apiVersion,
      deploymentName: AZURE_AI_CONFIG.deploymentName,
      maxTokens: AZURE_AI_CONFIG.maxTokens,
      temperature: AZURE_AI_CONFIG.temperature,
      timeout: AZURE_AI_CONFIG.timeout,
      availableAgents: AZURE_AI_AGENTS.map(agent => ({
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
      })),
    });
  }
};
