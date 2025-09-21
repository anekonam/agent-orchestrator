// Azure AI Foundry service to replace backend API calls
import { AZURE_AI_CONFIG, AZURE_AI_AGENTS, getDefaultAgent, getAgentById, AzureAIAgent } from '../config/azureAI';

export interface AzureAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AzureAIRequest {
  messages: AzureAIMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AzureAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ProjectQueryRequest {
  query: string;
  projectId: string;
  agentId?: string;
  includeProjectFiles?: boolean;
  additionalContext?: Record<string, any>;
}

export interface ProjectQueryResponse {
  queryId: string;
  response: string;
  agentUsed: string;
  timestamp: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  executionTime: number;
}

export interface ChatRequest {
  message: string;
  projectId: string;
  conversationHistory?: AzureAIMessage[];
  agentId?: string;
}

export interface ChatResponse {
  messageId: string;
  response: string;
  agentUsed: string;
  timestamp: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class AzureAIService {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': AZURE_AI_CONFIG.apiKey,
    };
  }

  private async makeRequest(agent: AzureAIAgent, request: AzureAIRequest): Promise<AzureAIResponse> {
    const url = `${agent.endpoint}?api-version=${AZURE_AI_CONFIG.apiVersion}`;
    
    const requestBody = {
      ...request,
      max_tokens: request.max_tokens || AZURE_AI_CONFIG.maxTokens,
      temperature: request.temperature || AZURE_AI_CONFIG.temperature,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Azure AI:', error);
      throw error;
    }
  }

  // Submit a project query to Azure AI agent
  async submitProjectQuery(request: ProjectQueryRequest): Promise<ProjectQueryResponse> {
    const startTime = Date.now();
    const agent = request.agentId ? getAgentById(request.agentId) : getDefaultAgent();
    
    if (!agent) {
      throw new Error(`Agent not found: ${request.agentId}`);
    }

    // Build system prompt based on agent capabilities
    const systemPrompt = this.buildSystemPrompt(agent, request);
    
    const messages: AzureAIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: request.query,
      },
    ];

    const aiRequest: AzureAIRequest = {
      messages,
    };

    try {
      const response = await this.makeRequest(agent, aiRequest);
      const executionTime = Date.now() - startTime;

      return {
        queryId: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        response: response.choices[0]?.message?.content || 'No response generated',
        agentUsed: agent.id,
        timestamp: new Date().toISOString(),
        tokenUsage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        executionTime,
      };
    } catch (error) {
      console.error('Error submitting project query:', error);
      throw error;
    }
  }

  // Handle chat messages
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const agent = request.agentId ? getAgentById(request.agentId) : getDefaultAgent();
    
    if (!agent) {
      throw new Error(`Agent not found: ${request.agentId}`);
    }

    // Build conversation with history
    const messages: AzureAIMessage[] = [
      {
        role: 'system',
        content: this.buildChatSystemPrompt(agent),
      },
      ...(request.conversationHistory || []),
      {
        role: 'user',
        content: request.message,
      },
    ];

    const aiRequest: AzureAIRequest = {
      messages,
    };

    try {
      const response = await this.makeRequest(agent, aiRequest);

      return {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        response: response.choices[0]?.message?.content || 'No response generated',
        agentUsed: agent.id,
        timestamp: new Date().toISOString(),
        tokenUsage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Get available agents
  getAvailableAgents(): AzureAIAgent[] {
    return AZURE_AI_AGENTS;
  }

  // Build system prompt for project queries
  private buildSystemPrompt(agent: AzureAIAgent, request: ProjectQueryRequest): string {
    let prompt = `You are ${agent.name}, ${agent.description}.\n\n`;
    
    prompt += `Your capabilities include: ${agent.capabilities.join(', ')}.\n\n`;
    
    prompt += `You are analyzing a query for Project ID: ${request.projectId}.\n\n`;
    
    if (request.includeProjectFiles) {
      prompt += `Consider any relevant project files and documents in your analysis.\n\n`;
    }
    
    if (request.additionalContext && Object.keys(request.additionalContext).length > 0) {
      prompt += `Additional context:\n${JSON.stringify(request.additionalContext, null, 2)}\n\n`;
    }
    
    prompt += `Provide a comprehensive analysis based on your expertise. Structure your response with:
1. Executive Summary
2. Key Insights
3. Recommendations
4. Next Steps

Be specific, actionable, and professional in your response.`;
    
    return prompt;
  }

  // Build system prompt for chat
  private buildChatSystemPrompt(agent: AzureAIAgent): string {
    return `You are ${agent.name}, ${agent.description}.

Your capabilities include: ${agent.capabilities.join(', ')}.

You are having a conversation with a user about their project. Be helpful, professional, and provide insights based on your expertise. Keep responses concise but informative.`;
  }
}

export const azureAIService = new AzureAIService();
