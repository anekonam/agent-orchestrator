// API configuration for the FAB Agents Dashboard
// Note: Legacy backend endpoints are preserved but disabled by default
// The application now uses Azure AI Foundry agents instead
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://api.fab.columbus.tech',
  USE_AZURE_AI: process.env.REACT_APP_USE_AZURE_AI !== 'false', // Default to true
  ENDPOINTS: {
    // Health endpoints
    HEALTH: '/api/v1/health',
    READY: '/api/v1/ready',
    
    // Agent endpoints
    AGENTS: '/api/v1/agents',
    AGENT_BY_ID: '/api/v1/agents/{id}',
    AGENTS_HEALTH: '/api/v1/agents/health',
    AGENT_HEALTH: '/api/v1/agents/health/{id}',
    AGENTS_METRICS: '/api/v1/agents/metrics',
    AGENTS_TOKEN_METRICS: '/api/v1/agents/metrics/tokens',
    
    // Project endpoints
    PROJECTS: '/api/v1/projects/',
    PROJECT_BY_ID: '/api/v1/projects/{id}',
    PROJECT_QUERY: '/api/v1/projects/{id}/query',
    PROJECT_REFRESH: '/api/v1/projects/{id}/refresh',
    PROJECT_HISTORY: '/api/v1/projects/{id}/history',
    PROJECT_CHAT_MESSAGES: '/api/v1/projects/{id}/chat-messages',
    
    // File endpoints
    PROJECT_FILE_UPLOAD: '/api/v1/files/project/{id}/upload',
    PROJECT_FILES: '/api/v1/files/project/{id}',
    FILE_PROCESS: '/api/v1/files/{id}/process',
    FILE_UPLOAD_GLOBAL: '/api/v1/files/upload',
    
    // Query endpoints
    QUERIES: '/api/v1/queries/',
    ACTIVE_QUERIES: '/api/v1/queries/active',
    QUERY_HISTORY: '/api/v1/queries/history',
    QUERY_BY_ID: '/api/v1/queries/{id}',
    QUERY_STREAM: '/api/v1/queries/{id}/stream',
    QUERY_COMMUNICATIONS: '/api/v1/queries/{id}/communications',
    QUERY_TASKS: '/api/v1/queries/{id}/tasks',
    QUERY_APPROVE: '/api/v1/queries/{id}/approve',
    QUERY_FOLLOWUP: '/api/v1/queries/{id}/followup',
    QUERY_FULL_RESULT: '/api/v1/queries/{id}/full-result',
    
    // Export endpoints
    PDF_GENERATE: '/api/v1/pdf/generate-professional',
    PDF_GENERATE_FAB: '/api/v1/pdf/generate-fab',
    PDF_GENERATE_COLUMBUS: '/api/v1/pdf/generate-columbus',
    PDF_QUERY: '/api/v1/pdf/query/{id}',
    PPTX_GENERATE: '/api/v1/pptx/generate',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace path parameters like {id} with actual values
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  return url;
};

// Pre-built common API URLs
export const API_URLS = {
  // Health endpoints
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
  READY: buildApiUrl(API_CONFIG.ENDPOINTS.READY),
  
  // Agent endpoints
  AGENTS: buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS),
  getAgentUrl: (agentId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENT_BY_ID, { id: agentId }),
  AGENTS_HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS_HEALTH),
  getAgentHealthUrl: (agentId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.AGENT_HEALTH, { id: agentId }),
  AGENTS_METRICS: buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS_METRICS),
  AGENTS_TOKEN_METRICS: buildApiUrl(API_CONFIG.ENDPOINTS.AGENTS_TOKEN_METRICS),
  
  // Project endpoints
  PROJECTS: buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS),
  getProjectUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BY_ID, { id: projectId }),
  getProjectQueryUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_QUERY, { id: projectId }),
  getProjectRefreshUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_REFRESH, { id: projectId }),
  getProjectHistoryUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_HISTORY, { id: projectId }),
  getProjectChatMessagesUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_CHAT_MESSAGES, { id: projectId }),
    
  // File endpoints
  getProjectFileUploadUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_FILE_UPLOAD, { id: projectId }),
  getProjectFilesUrl: (projectId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_FILES, { id: projectId }),
  getFileProcessUrl: (fileId: string, forceReprocess: boolean = false) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.FILE_PROCESS, { id: fileId }) + `?force_reprocess=${forceReprocess}`,
  FILE_UPLOAD_GLOBAL: buildApiUrl(API_CONFIG.ENDPOINTS.FILE_UPLOAD_GLOBAL),
    
  // Query endpoints
  QUERIES: buildApiUrl(API_CONFIG.ENDPOINTS.QUERIES),
  ACTIVE_QUERIES: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVE_QUERIES),
  QUERY_HISTORY: buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_HISTORY),
  getQueryUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_BY_ID, { id: queryId }),
  getQueryStreamUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_STREAM, { id: queryId }),
  getQueryCommunicationsUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_COMMUNICATIONS, { id: queryId }),
  getQueryTasksUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_TASKS, { id: queryId }),
  getQueryApproveUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_APPROVE, { id: queryId }),
  getQueryFollowupUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_FOLLOWUP, { id: queryId }),
  getQueryFullResultUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.QUERY_FULL_RESULT, { id: queryId }),
    
  // Export endpoints
  PDF_GENERATE: buildApiUrl(API_CONFIG.ENDPOINTS.PDF_GENERATE),
  PDF_GENERATE_FAB: buildApiUrl(API_CONFIG.ENDPOINTS.PDF_GENERATE_FAB),
  PDF_GENERATE_COLUMBUS: buildApiUrl(API_CONFIG.ENDPOINTS.PDF_GENERATE_COLUMBUS),
  getPdfQueryUrl: (queryId: string) => 
    buildApiUrl(API_CONFIG.ENDPOINTS.PDF_QUERY, { id: queryId }),
  PPTX_GENERATE: buildApiUrl(API_CONFIG.ENDPOINTS.PPTX_GENERATE),
};