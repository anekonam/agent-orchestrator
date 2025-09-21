export type ProjectStatus = "active" | "archived" | "deleted";

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

export interface ChatMessageRequest {
  entry_id: string;
  message_type: 'user' | 'system' | 'assistant' | 'processing' | 'execution_plan';
  content: string;
  query_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  trend: string;
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

export interface Chart {
  type: string;
  title: string;
  data?: ChartData[]; // Optional for combo charts
  labels?: string[]; // For combo charts
  datasets?: Dataset[]; // For combo charts
  xAxisLabel?: string;
  yAxisLabel?: string;
  chart_config?: ChartConfig; // For scatter charts
  sources?: string[];
  strategic_implication?: string;
  insight_details?: string;
}

export interface Area {
  summary: string;
  content: string;
  key_points?: KeyPoints[];
  kpis?: KPI[];
  charts?: Chart[];
  tables?: any[];
  sources?: string[];
}

export interface KeyPoints {
  label: string;
  value: string;
  subtext: string;
}

export interface Recommendation {
  priority: string;
  title: string;
  description: string;
  impact: string;
  timeline: string;
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

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary?: string;
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

export interface ProjectFile {
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  project_id: string;
}

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