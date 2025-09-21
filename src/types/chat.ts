// Simple message type for chat display
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "file";
  content: string;
  timestamp: string;
  metadata?: {
    type?: string;
    is_result?: boolean;
    executionPlan?: any;
    queryId?: string;
    source?: string;  // For tracking message source (e.g., 'approval_button')
    timestamp?: string;  // Additional timestamp for metadata tracking
    attachedFiles?: Array<{
      name: string;
      size: number;
      type: string;
      uploaded_at?: string;
    }>;
    files?: Array<{
      name: string;
      size: number;
      type: string;
      uploaded_at?: string;
    }>;
    // Error handling metadata
    isError?: boolean;
    errorType?: string;
    originalQuery?: string;
    canRetry?: boolean;
  };
}