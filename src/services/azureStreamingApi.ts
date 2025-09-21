// Azure AI-powered Streaming API replacement
// Replaces Server-Sent Events with simple HTTP calls to Azure AI
import { azureAIService, ProjectQueryRequest, ChatRequest } from './azureAIService';
import { projectsAPI } from './azureProjectsApi';
import { ConversationEntry, QueryResult } from '../types/project';
import { ChatMessage } from '../types/chat';

export interface QueryPayload {
  query: string;
  is_followup: boolean;
  parent_entry_id: string | null;
  include_project_files: boolean;
  additional_context: Record<string, any>;
}

export interface StreamingQueryResponse {
  query_id?: string;
  queryId?: string;
  query?: string;
  status: 'processing' | 'completed' | 'failed' | 'pending_approval' | 'rejected';
  progress?: number;
  steps?: any[];
  result?: any;
  structured_response?: any;
  areas?: Record<string, any>;
  done?: boolean;
  executionPlan?: any;
  currentStep?: string;
  currentAgent?: string;
  activeAgent?: string;
  totalSteps?: number | null;
  startTime?: string;
  endTime?: string;
  context?: any;
  visualizations?: any[];
  sources?: any[];
  confidence_score?: number | null;
  execution_time_ms?: number | null;
  errors?: any[];
  rejection_reason?: string;
  error?: string;
}

export interface QueryStep {
  stepId: string;
  agent: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  action: string;
  reasoning?: string;
  result?: any;
  startTime?: string;
  endTime?: string;
}

// Mock EventSource for compatibility
class MockEventSource {
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onopen: ((event: Event) => void) | null = null;
  public readyState: number = 1; // OPEN
  public withCredentials: boolean = false;

  // EventSource constants
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;

  constructor(public url: string) {
    // Simulate immediate connection
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  addEventListener(type: string, listener: EventListener): void {
    // Basic implementation for compatibility
    if (type === 'message' && typeof listener === 'function') {
      this.onmessage = listener as any;
    } else if (type === 'error' && typeof listener === 'function') {
      this.onerror = listener as any;
    } else if (type === 'open' && typeof listener === 'function') {
      this.onopen = listener as any;
    }
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Basic implementation for compatibility
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'error') {
      this.onerror = null;
    } else if (type === 'open') {
      this.onopen = null;
    }
  }

  dispatchEvent(event: Event): boolean {
    // Basic implementation for compatibility
    return true;
  }

  // Simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(data),
      });
      this.onmessage(event);
    }
  }

  // Simulate completion
  simulateCompletion(result: any) {
    this.simulateMessage({
      status: 'completed',
      result,
      done: true,
    });
  }

  // Simulate error
  simulateError(error: string) {
    this.simulateMessage({
      status: 'failed',
      error,
      done: true,
    });
  }
}

class AzureStreamingAPIService {
  // Submit query to project and get "streaming" response (actually immediate)
  async submitProjectQuery(
    projectId: string,
    query: string,
    parentEntryId?: string,
    includeProjectFiles: boolean = true,
    additionalContext: Record<string, any> = {}
  ): Promise<{
    queryId: string;
    entryId: string;
    eventSource: EventSource;
  }> {
    try {
      const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create mock event source
      const eventSource = new MockEventSource(`/mock/stream/${queryId}`);

      // Process query asynchronously
      this.processProjectQueryAsync(
        projectId,
        query,
        queryId,
        entryId,
        parentEntryId,
        includeProjectFiles,
        additionalContext,
        eventSource
      );

      return { queryId, entryId, eventSource: eventSource as unknown as EventSource };
    } catch (error) {
      console.error('Error submitting project query:', error);
      throw error;
    }
  }

  // Process project query asynchronously and simulate streaming
  private async processProjectQueryAsync(
    projectId: string,
    query: string,
    queryId: string,
    entryId: string,
    parentEntryId?: string,
    includeProjectFiles: boolean = true,
    additionalContext: Record<string, any> = {},
    eventSource?: MockEventSource
  ) {
    try {
      // Simulate processing steps
      if (eventSource) {
        eventSource.simulateMessage({
          queryId,
          status: 'processing',
          progress: 10,
          currentStep: 'Initializing Azure AI agent...',
          currentAgent: 'financial-analyst',
        });
      }

      await this.delay(500);

      if (eventSource) {
        eventSource.simulateMessage({
          queryId,
          status: 'processing',
          progress: 30,
          currentStep: 'Processing query with Azure AI...',
          currentAgent: 'financial-analyst',
        });
      }

      // Make actual Azure AI call
      const azureRequest: ProjectQueryRequest = {
        query,
        projectId,
        includeProjectFiles,
        additionalContext: {
          ...additionalContext,
          isFollowup: Boolean(parentEntryId),
          parentEntryId,
        },
      };

      const azureResponse = await azureAIService.submitProjectQuery(azureRequest);

      await this.delay(300);

      if (eventSource) {
        eventSource.simulateMessage({
          queryId,
          status: 'processing',
          progress: 80,
          currentStep: 'Formatting response...',
          currentAgent: 'financial-analyst',
        });
      }

      // Create conversation entry
      const conversationEntry: ConversationEntry = {
        entry_id: entryId,
        project_id: projectId,
        timestamp: new Date().toISOString(),
        query: {
          query_id: queryId,
          query,
          context: additionalContext,
          focus_areas: [],
          timeframe: null,
          user_id: null,
          session_id: `session_${Date.now()}`,
          debug: false,
        },
        query_id: queryId,
        result: {
          query_id: queryId,
          status: 'completed',
          summary: azureResponse.response,
          sections: {
            executive_summary: azureResponse.response,
            areas: {},
            recommendations: [],
            next_steps: [],
            agent_responses: {
              [azureResponse.agentUsed]: {
                status: 'completed',
                analysis: azureResponse.response,
                processing_time: azureResponse.executionTime,
                token_usage: {
                  ...azureResponse.tokenUsage,
                  model: 'azure-ai-foundry',
                  cost: 0.0, // Azure AI Foundry cost calculation would go here
                },
              },
            },
            metrics: [],
            key_insights: {},
            swot_analysis: {
              strengths: [],
              weaknesses: [],
              opportunities: [],
              threats: [],
            },
          },
          visualizations: [],
          sources: [],
          confidence_score: 0.8,
          execution_time_ms: azureResponse.executionTime,
          errors: [],
        },
        is_followup: Boolean(parentEntryId),
        parent_entry_id: parentEntryId || null,
      };

      // Update project with new conversation entry
      const project = await projectsAPI.getProject(projectId);
      if (project) {
        project.conversation_history = project.conversation_history || [];
        project.conversation_history.push(conversationEntry);
        project.conversation_count = project.conversation_history.length;
        project.has_result = true;
        project.updated_at = new Date().toISOString();

        await projectsAPI.updateProject(projectId, {
          metadata: {
            ...project.metadata,
            conversation_history: project.conversation_history,
            conversation_count: project.conversation_count,
            has_result: project.has_result,
          },
        });
      }

      await this.delay(200);

      // Send completion
      if (eventSource) {
        eventSource.simulateCompletion({
          queryId,
          status: 'completed',
          result: conversationEntry.result,
          structured_response: conversationEntry.result?.sections,
          execution_time_ms: azureResponse.executionTime,
          done: true,
        });
      }
    } catch (error) {
      console.error('Error processing project query:', error);
      if (eventSource) {
        eventSource.simulateError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // Submit project query with files
  async submitProjectQueryWithFiles(
    projectId: string,
    query: string,
    files: File[],
    parentEntryId?: string,
    includeProjectFiles: boolean = true,
    additionalContext: Record<string, any> = {},
    onUploadProgress?: (progress: number) => void
  ): Promise<{
    queryId: string;
    entryId: string;
    eventSource: EventSource;
    failedFiles?: string[];
  }> {
    // For Azure AI, we don't actually upload files, just simulate the process
    const failedFiles: string[] = [];

    // Simulate upload progress
    if (onUploadProgress) {
      onUploadProgress(50);
      await this.delay(100);
      onUploadProgress(100);
    }

    // Call the regular query method
    const result = await this.submitProjectQuery(
      projectId,
      query,
      parentEntryId,
      includeProjectFiles,
      {
        ...additionalContext,
        fileNames: files.map(f => f.name),
        fileCount: files.length,
      }
    );

    return {
      ...result,
      failedFiles,
    };
  }

  // Submit chat message
  async submitChatMessage(
    projectId: string,
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<{
    messageId: string;
    response: string;
    timestamp: string;
  }> {
    try {
      // Convert chat history to Azure AI format
      const azureHistory = conversationHistory?.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })) || [];

      const chatRequest: ChatRequest = {
        message,
        projectId,
        conversationHistory: azureHistory,
      };

      const chatResponse = await azureAIService.sendChatMessage(chatRequest);

      return {
        messageId: chatResponse.messageId,
        response: chatResponse.response,
        timestamp: chatResponse.timestamp,
      };
    } catch (error) {
      console.error('Error submitting chat message:', error);
      throw error;
    }
  }

  // Submit follow-up query (compatibility method)
  async submitFollowupQuery(
    queryId: string,
    followupQuery: string,
    includeProjectFiles: boolean = true,
    additionalContext: Record<string, any> = {}
  ): Promise<{
    queryId: string;
    eventSource: EventSource;
  }> {
    // For Azure AI, we treat follow-up queries the same as regular queries
    const result = await this.submitProjectQuery(
      'current-project', // We don't have project ID in this context
      followupQuery,
      queryId, // Use original query ID as parent
      includeProjectFiles,
      additionalContext
    );

    return {
      queryId: result.queryId,
      eventSource: result.eventSource,
    };
  }

  // Submit follow-up query with files (compatibility method)
  async submitFollowupQueryWithFiles(
    projectId: string,
    queryId: string,
    followupQuery: string,
    files: File[],
    includeProjectFiles: boolean = true,
    additionalContext: Record<string, any> = {},
    onUploadProgress?: (progress: number) => void
  ): Promise<{
    queryId: string;
    eventSource: EventSource;
    failedFiles?: string[];
  }> {
    // For Azure AI, we treat follow-up queries with files the same as regular queries
    const result = await this.submitProjectQueryWithFiles(
      projectId,
      followupQuery,
      files,
      queryId, // Use original query ID as parent
      includeProjectFiles,
      additionalContext,
      onUploadProgress
    );

    return {
      queryId: result.queryId,
      eventSource: result.eventSource,
      failedFiles: result.failedFiles,
    };
  }

  // Submit approval feedback (compatibility method)
  async submitApprovalFeedback(
    queryId: string,
    userMessage: string
  ): Promise<void> {
    // For Azure AI, we don't need approval feedback since we use simple calls
    // This is a compatibility method for the existing UI
    console.log(`Approval feedback for query ${queryId}: ${userMessage}`);
  }

  // Add chat message (compatibility method)
  async addChatMessage(
    projectId: string,
    messageData: any
  ): Promise<any> {
    // For Azure AI, we don't need to save chat messages separately
    // This is a compatibility method for the existing UI
    console.log(`Adding chat message for project ${projectId}:`, messageData);
    return { message_id: `msg_${Date.now()}`, timestamp: new Date().toISOString(), status: 'saved' };
  }

  // Fetch query full result (compatibility method)
  async fetchQueryFullResult(queryId: string, initialQuery: string = ""): Promise<StreamingQueryResponse> {
    // For Azure AI, we don't store query results separately
    // Return a basic completed response
    return {
      queryId,
      status: 'completed',
      result: 'Query completed successfully with Azure AI',
      done: true,
      progress: 100,
    };
  }

  // Submit sync query (compatibility method)
  async submitSyncQuery(
    projectId: string,
    query: string,
    projectName: string,
    uploadedFiles: any[] = []
  ): Promise<{
    queryId: string;
    entryId: string;
    eventSource: EventSource;
  }> {
    // For Azure AI, sync queries are the same as regular queries
    const result = await this.submitProjectQuery(
      projectId,
      query,
      undefined, // no parent entry
      true, // includeProjectFiles
      {
        projectName,
        uploadedFiles,
        isSync: true,
      }
    );

    return {
      queryId: result.queryId,
      entryId: result.entryId,
      eventSource: result.eventSource,
    };
  }

  // Helper method to simulate delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get available agents (from Azure AI config)
  getAvailableAgents() {
    return azureAIService.getAvailableAgents();
  }
}

export const streamingAPI = new AzureStreamingAPIService();
export { AzureStreamingAPIService as StreamingAPIService };
