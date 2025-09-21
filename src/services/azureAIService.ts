// Azure AI Projects service to replace backend API calls
// Based on Azure AI Foundry Projects API pattern
import { AZURE_AI_CONFIG, AZURE_AI_AGENTS, getDefaultAgent, getAgentById, AzureAIAgent, AGENT_IDS } from '../config/azureAI';

// Azure AI Projects API interfaces
export interface AzureAIProjectsThread {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, any>;
}

export interface AzureAIProjectsMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
      annotations?: any[];
    };
  }>;
}

export interface AzureAIProjectsRun {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  last_error?: {
    code: string;
    message: string;
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
  threadId: string;
  runId: string;
  executionTime: number;
}

export interface ChatRequest {
  message: string;
  projectId: string;
  threadId?: string;
  agentId?: string;
}

export interface ChatResponse {
  messageId: string;
  response: string;
  agentUsed: string;
  timestamp: string;
  threadId: string;
  runId: string;
}

class AzureAIService {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': AZURE_AI_CONFIG.apiKey,
    };
  }

  // Create a new thread for conversation
  private async createThread(): Promise<AzureAIProjectsThread> {
    const url = `${AZURE_AI_CONFIG.projectEndpoint}/threads`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Projects API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  // Create a message in a thread
  private async createMessage(threadId: string, content: string): Promise<AzureAIProjectsMessage> {
    const url = `${AZURE_AI_CONFIG.projectEndpoint}/threads/${threadId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          role: 'user',
          content: content,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Projects API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Create and run a conversation with an agent
  private async createRun(threadId: string, agentId: string): Promise<AzureAIProjectsRun> {
    const url = `${AZURE_AI_CONFIG.projectEndpoint}/threads/${threadId}/runs`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          assistant_id: agentId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Projects API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating run:', error);
      throw error;
    }
  }

  // Get run status
  private async getRun(threadId: string, runId: string): Promise<AzureAIProjectsRun> {
    const url = `${AZURE_AI_CONFIG.projectEndpoint}/threads/${threadId}/runs/${runId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Projects API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting run:', error);
      throw error;
    }
  }

  // Get messages from a thread
  private async getMessages(threadId: string): Promise<AzureAIProjectsMessage[]> {
    const url = `${AZURE_AI_CONFIG.projectEndpoint}/threads/${threadId}/messages?order=asc`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure AI Projects API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Poll until run completes
  private async waitForRunCompletion(threadId: string, runId: string): Promise<AzureAIProjectsRun> {
    let run = await this.getRun(threadId, runId);

    while (run.status === 'queued' || run.status === 'in_progress') {
      // Wait for a second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await this.getRun(threadId, runId);
    }

    return run;
  }

  // Submit a project query to Azure AI agent
  async submitProjectQuery(request: ProjectQueryRequest): Promise<ProjectQueryResponse> {
    const startTime = Date.now();
    const agent = request.agentId ? getAgentById(request.agentId) : getDefaultAgent();

    if (!agent) {
      throw new Error(`Agent not found: ${request.agentId}`);
    }

    try {
      // Create a new thread
      const thread = await this.createThread();

      // Create a message with the query
      await this.createMessage(thread.id, request.query);

      // Create and run the conversation
      const run = await this.createRun(thread.id, agent.id);

      // Wait for completion
      const completedRun = await this.waitForRunCompletion(thread.id, run.id);

      if (completedRun.status === 'failed') {
        throw new Error(`Run failed: ${completedRun.last_error?.message || 'Unknown error'}`);
      }

      // Get the response messages
      const messages = await this.getMessages(thread.id);
      const assistantMessage = messages.find(m => m.role === 'assistant');
      const responseContent = assistantMessage?.content.find(c => c.type === 'text')?.text.value || 'No response generated';

      const executionTime = Date.now() - startTime;

      return {
        queryId: `query_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        response: responseContent,
        agentUsed: agent.id,
        timestamp: new Date().toISOString(),
        threadId: thread.id,
        runId: run.id,
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

    try {
      let threadId = request.threadId;

      // Create a new thread if none provided
      if (!threadId) {
        const thread = await this.createThread();
        threadId = thread.id;
      }

      // Create a message with the chat content
      await this.createMessage(threadId, request.message);

      // Create and run the conversation
      const run = await this.createRun(threadId, agent.id);

      // Wait for completion
      const completedRun = await this.waitForRunCompletion(threadId, run.id);

      if (completedRun.status === 'failed') {
        throw new Error(`Run failed: ${completedRun.last_error?.message || 'Unknown error'}`);
      }

      // Get the response messages
      const messages = await this.getMessages(threadId);
      const assistantMessage = messages.find(m => m.role === 'assistant' && m.created_at > completedRun.created_at);
      const responseContent = assistantMessage?.content.find(c => c.type === 'text')?.text.value || 'No response generated';

      return {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        response: responseContent,
        agentUsed: agent.id,
        timestamp: new Date().toISOString(),
        threadId: threadId,
        runId: run.id,
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


}

export const azureAIService = new AzureAIService();
