# Dashboard API Documentation

## Quick Model Reference

### Primary Models Used in API
- **`Project`** - Main project entity used in project endpoints
- **`QueryPayload`** - Request body for submitting queries
- **`StreamingQueryResponse`** - Response from streaming/query endpoints
- **`ChatMessageRequest`/`ChatMessageResponse`** - Chat message handling
- **`ConversationEntry`** - Conversation history entries
- **`ProjectFile`** - File metadata for project files
- **`QueryResult`** - Complete query result structure
- **`QueryResultSections`** - Structured response sections for reports
- **`TokenUsage`** - Token metrics and cost tracking
- **`Chart`** - Chart configuration for visualizations

## Base Configuration

```typescript
BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://api.fab-agents.columbus.tech'
```

## Endpoints

### Health Endpoints

#### GET `/api/v1/health`
Check API health status.

**Response:**
```typescript
{
  status: "healthy" | "unhealthy",
  timestamp: string
}
```

#### GET `/api/v1/ready`
Check if API is ready to serve requests.

**Response:**
```typescript
{
  ready: boolean,
  services: Record<string, boolean>
}
```

### Agent Endpoints

#### GET `/api/v1/agents`
Get list of all available agents.

**Response Model:**
```typescript
Array<{
  id: string,
  name: string,
  status: "online" | "offline",
  capabilities: string[],
  metadata: Record<string, any>
}>
```

#### GET `/api/v1/agents/{id}`
Get details of a specific agent.

**Parameters:**
- `id`: Agent identifier

**Response:**
```typescript
{
  id: string,
  name: string,
  status: "online" | "offline",
  capabilities: string[],
  metadata: Record<string, any>
}
```

#### GET `/api/v1/agents/health`
Get health status of all agents.

**Response:**
```typescript
Record<string, {
  status: "healthy" | "unhealthy",
  lastCheck: string,
  responseTime: number
}>
```

#### GET `/api/v1/agents/health/{id}`
Get health status of a specific agent.

**Parameters:**
- `id`: Agent identifier

**Response:**
```typescript
{
  status: "healthy" | "unhealthy",
  lastCheck: string,
  responseTime: number,
  details: Record<string, any>
}
```

#### GET `/api/v1/agents/metrics`
Get metrics for all agents.

**Response:**
```typescript
{
  totalRequests: number,
  successRate: number,
  avgResponseTime: number,
  agents: Record<string, {
    requests: number,
    errors: number,
    avgTime: number
  }>
}
```

#### GET `/api/v1/agents/metrics/tokens`
Get token usage metrics for agents.

**Response Model:** Uses `TokenUsage`
```typescript
{
  totalTokens: number,
  totalCost: number,
  byAgent: Record<string, TokenUsage>
}
```

### Project Endpoints

#### GET `/api/v1/projects/`
Get list of all projects.

**Response Model:** `Array<Project>`
```typescript
Array<Project>
```

#### POST `/api/v1/projects/`
Create a new project.

**Request Model:**
```typescript
{
  name: string,
  description?: string,
  initial_query?: string,
  metadata?: Record<string, any>
}
```

**Response Model:** `Project`
```typescript
Project
```

#### GET `/api/v1/projects/{id}`
Get a specific project by ID.

**Parameters:**
- `id`: Project identifier

**Response Model:** `Project`
```typescript
Project
```

#### PUT `/api/v1/projects/{id}`
Update a project.

**Parameters:**
- `id`: Project identifier

**Request Model:** Uses `ProjectStatus`
```typescript
{
  name?: string,
  description?: string,
  status?: ProjectStatus,
  metadata?: Record<string, any>
}
```

**Response Model:** `Project`
```typescript
Project
```

#### DELETE `/api/v1/projects/{id}`
Delete a project.

**Parameters:**
- `id`: Project identifier

**Response:**
```typescript
{
  success: boolean,
  message: string
}
```

#### POST `/api/v1/projects/{id}/query`
Submit a query to a project.

**Parameters:**
- `id`: Project identifier

**Request Model:** `QueryPayload`
```typescript
QueryPayload
```

**Response Model:**
```typescript
{
  queryId: string,
  entryId: string,
  status: "processing" | "pending_approval"
}
```

#### POST `/api/v1/projects/{id}/refresh`
Refresh/sync a project.

**Parameters:**
- `id`: Project identifier

**Response:**
```typescript
{
  success: boolean,
  queryId: string
}
```

#### GET `/api/v1/projects/{id}/history`
Get conversation history for a project.

**Parameters:**
- `id`: Project identifier

**Response Model:** `Array<ConversationEntry>`
```typescript
Array<ConversationEntry>
```

#### POST `/api/v1/projects/{id}/chat-messages`
Add a chat message to project conversation.

**Parameters:**
- `id`: Project identifier

**Request Model:** `ChatMessageRequest`
```typescript
ChatMessageRequest
```

**Response Model:** `ChatMessageResponse`
```typescript
ChatMessageResponse
```

### File Endpoints

#### POST `/api/v1/files/project/{id}/upload`
Upload a file to a specific project.

**Parameters:**
- `id`: Project identifier

**Request:**
- `multipart/form-data` with file field

**Response:**
```typescript
{
  file_id: string,
  filename: string,
  file_size: number,
  content_type: string,
  uploaded_at: string
}
```

#### GET `/api/v1/files/project/{id}`
Get all files for a project.

**Parameters:**
- `id`: Project identifier

**Response Model:** `Array<ProjectFile>`
```typescript
Array<ProjectFile>
```

#### POST `/api/v1/files/{id}/process`
Process an uploaded file.

**Parameters:**
- `id`: File identifier
- `force_reprocess`: boolean (query param, default: false)

**Response:**
```typescript
{
  status: "processing" | "completed" | "failed",
  chunks_created: number,
  vectors_created: number
}
```

#### POST `/api/v1/files/upload`
Upload a file to global storage.

**Request:**
- `multipart/form-data` with file field

**Response:**
```typescript
{
  file_id: string,
  filename: string,
  file_size: number,
  content_type: string
}
```

### Query Endpoints

#### GET `/api/v1/queries/`
Get all queries.

**Response:**
```typescript
Array<{
  query_id: string,
  query: string,
  status: string,
  created_at: string,
  project_id?: string
}>
```

#### GET `/api/v1/queries/active`
Get all active queries.

**Response:**
```typescript
Array<{
  query_id: string,
  query: string,
  status: "processing" | "pending_approval",
  progress: number,
  started_at: string
}>
```

#### GET `/api/v1/queries/history`
Get query history.

**Query Parameters:**
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response:**
```typescript
{
  total: number,
  items: Array<{
    query_id: string,
    query: string,
    status: string,
    created_at: string,
    completed_at?: string,
    result_summary?: string
  }>
}
```

#### GET `/api/v1/queries/{id}`
Get a specific query.

**Parameters:**
- `id`: Query identifier

**Response Model:** Partial `QueryResult`
```typescript
{
  query_id: string,
  query: string,
  status: string,
  result?: QueryResult,
  created_at: string,
  completed_at?: string
}
```

#### GET `/api/v1/queries/{id}/stream`
Stream query execution updates (Server-Sent Events).

**Parameters:**
- `id`: Query identifier

**Response Model (SSE):** `StreamingQueryResponse`
```typescript
// Event: update
StreamingQueryResponse

// Event: done
{
  status: "completed",
  result: any,
  execution_time_ms: number
}

// Event: error
{
  error: string,
  details?: any
}
```

#### GET `/api/v1/queries/{id}/communications`
Get agent communications for a query.

**Parameters:**
- `id`: Query identifier

**Response:**
```typescript
Array<{
  agent: string,
  timestamp: string,
  type: "request" | "response",
  content: any
}>
```

#### GET `/api/v1/queries/{id}/tasks`
Get task distribution for a query.

**Parameters:**
- `id`: Query identifier

**Response:**
```typescript
Array<{
  task_id: string,
  agent: string,
  status: string,
  started_at: string,
  completed_at?: string,
  result?: any
}>
```

#### POST `/api/v1/queries/{id}/approve`
Approve a pending query.

**Parameters:**
- `id`: Query identifier

**Request:**
```typescript
{
  feedback?: string,
  proceed: boolean
}
```

**Response:**
```typescript
{
  status: "processing" | "cancelled",
  message: string
}
```

#### POST `/api/v1/queries/{id}/followup`
Submit a follow-up query.

**Parameters:**
- `id`: Parent query identifier

**Request Model:** Partial `QueryPayload`
```typescript
{
  query: string,
  include_project_files: boolean,
  additional_context?: Record<string, any>
}
```

**Response:**
```typescript
{
  queryId: string,
  status: "processing"
}
```

#### GET `/api/v1/queries/{id}/full-result`
Get the full result of a completed query.

**Parameters:**
- `id`: Query identifier

**Response Model:** `StreamingQueryResponse`
```typescript
StreamingQueryResponse
```

### Export Endpoints

#### POST `/api/v1/pdf/generate-professional`
Generate a professional PDF report.

**Request Model:** Uses `QueryResultSections`
```typescript
{
  title: string,
  content: QueryResultSections,
  metadata?: Record<string, any>
}
```

**Response:**
- Binary PDF file

#### POST `/api/v1/pdf/generate-fab`
Generate a FAB-branded PDF report.

**Request Model:** Uses `QueryResultSections`
```typescript
{
  title: string,
  content: QueryResultSections,
  metadata?: Record<string, any>
}
```

**Response:**
- Binary PDF file

#### POST `/api/v1/pdf/generate-columbus`
Generate a Columbus-branded PDF report.

**Request Model:** Uses `QueryResultSections`
```typescript
{
  title: string,
  content: QueryResultSections,
  metadata?: Record<string, any>
}
```

**Response:**
- Binary PDF file

#### GET `/api/v1/pdf/query/{id}`
Generate PDF from query results.

**Parameters:**
- `id`: Query identifier

**Response:**
- Binary PDF file

#### POST `/api/v1/pptx/generate`
Generate a PowerPoint presentation.

**Request Model:** Uses `Chart[]`
```typescript
{
  title: string,
  slides: Array<{
    title: string,
    content: string,
    charts?: Chart[],
    tables?: any[]
  }>,
  metadata?: Record<string, any>
}
```

**Response:**
- Binary PPTX file

## TypeScript Interfaces and Types

### Core Types

```typescript
// Project Status
export type ProjectStatus = "active" | "archived" | "deleted";

// Chat Message
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
    source?: string;
    timestamp?: string;
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
  };
}
```

### Query Models

```typescript
export interface QueryData {
  query_id: string;
  query: string;
  context: Record<string, any>;
  focus_areas: string[];
  timeframe: string | null;
  user_id: string | null;
  session_id: string;
  debug: boolean;
}

export interface QueryPayload {
  query: string;
  is_followup: boolean;
  parent_entry_id: string | null;
  include_project_files: boolean;
  additional_context: Record<string, any>;
}

export interface QueryResult {
  query_id: string;
  status: string;
  summary: string | null;
  sections: QueryResultSections;
  visualizations: any[];
  sources: any[];
  confidence_score: number | null;
  execution_time_ms: number | null;
  errors: any[];
}

export interface QueryResultSections {
  executive_summary: string;
  summary?: string;
  areas: Record<string, Area>;
  recommendations: Recommendation[];
  next_steps: string[];
  agent_responses: Record<string, AgentResponse>;
  metrics: any[];
  key_insights: any;
  swot_analysis: SWOTData;
  executive_enhancement?: any;
  metadata?: any;
  charts?: any[];
  extraction_metadata?: any;
}
```

### Streaming Response Models

```typescript
export interface StreamingQueryResponse {
  query_id?: string;
  queryId?: string;
  query?: string;
  status: 'processing' | 'completed' | 'failed' | 'pending_approval' | 'rejected';
  progress?: number;
  steps?: QueryStep[];
  result?: any;
  structured_response?: QueryResultSections;
  areas?: Record<string, Area>;
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
  tokenUsage?: TokenUsage;
  startTime?: string;
  endTime?: string;
}
```

### Project Models

```typescript
export interface Project {
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  status: ProjectStatus;
  initial_query: string | null;
  conversation_history: ConversationEntry[];
  conversation_count?: number;
  files_count?: number;
  files: ProjectFile[];
  metadata: Record<string, any>;
  has_result?: boolean;
}

export interface ProjectFile {
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  project_id: string;
}

export interface ConversationEntry {
  entry_id: string;
  project_id: string;
  timestamp: string;
  query: QueryData;
  query_id: string;
  result: QueryResult | null;
  is_followup: boolean;
  parent_entry_id: string | null;
  chat_messages?: ChatMessageRequest[];
}
```

### Chat Models

```typescript
export interface ChatMessageRequest {
  entry_id: string;
  message_type: 'user' | 'system' | 'assistant' | 'processing' | 'execution_plan';
  content: string;
  query_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface ChatMessageResponse {
  message_id: string;
  timestamp: string;
  status: 'saved';
}
```

### Content Models

```typescript
export interface Area {
  summary: string;
  content: string;
  key_points?: KeyPoints[];
  kpis?: KPI[];
  charts?: Chart[];
  tables?: any[];
}

export interface KeyPoints {
  label: string;
  value: string;
  subtext: string;
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: string;
}

export interface Recommendation {
  priority: string;
  title: string;
  description: string;
  impact: string;
  timeline: string;
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary?: string;
}
```

### Chart Models

```typescript
export interface Chart {
  type: string;
  title: string;
  data?: ChartData[];
  labels?: string[];
  datasets?: Dataset[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  chart_config?: ChartConfig;
  sources?: string[];
  strategic_implication?: string;
  insight_details?: string;
}

export interface ChartData {
  label: string;
  value?: number;
  name?: string;
  x?: number;
  y?: number;
}

export interface Dataset {
  label: string;
  type: string;
  data: number[];
  yAxisID?: string;
}

export interface ChartConfig {
  x_domain?: number[];
  y_domain?: number[];
  x_label?: string;
  y_label?: string;
  x_ref_line?: number;
  y_ref_line?: number;
  pointStyle?: string;
  quadrant_labels?: {
    topRight?: string;
    topLeft?: string;
    bottomRight?: string;
    bottomLeft?: string;
  };
}
```

### Agent Models

```typescript
export interface AgentResponse {
  error?: string;
  status: string;
  analysis?: string;
  risk_assessment?: any;
  compliance_assessment?: any;
  customer_insights?: any;
  technology_assessment?: any;
  metrics?: any;
  processing_time?: number;
  token_usage?: TokenUsage;
}

export interface TokenUsage {
  prompt_tokens?: number;
  promptTokens?: number;
  completion_tokens?: number;
  completionTokens?: number;
  total_tokens?: number;
  totalTokens?: number;
  model: string;
  cost: number;
}
```

### File Registry Models

```typescript
export interface FileInfo {
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  scope: string;
  category: string;
  status: string;
  uploaded_at: string;
  processed_at: string | null;
  project_id: string | null;
  uploader_id: string;
  chunk_count: number;
  vector_count: number;
  error_message: string | null;
  document_metadata: Record<string, any>;
  tags: string[];
}

export interface FileRegistryState {
  files: FileInfo[];
  fileMap: Map<string, FileInfo>;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export interface FileRegistryContextType {
  state: FileRegistryState;
  getFileByName: (filename: string) => FileInfo | undefined;
  getDownloadUrl: (fileId: string) => string;
  isFileAvailable: (filename: string) => boolean;
  refreshFileRegistry: () => Promise<void>;
}
```

## Error Responses

All endpoints may return error responses in the following format:

```typescript
{
  error: string,
  message: string,
  details?: any,
  status_code: number
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error
- `503`: Service Unavailable