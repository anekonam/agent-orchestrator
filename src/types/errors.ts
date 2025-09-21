/**
 * Error types and interfaces for unified error handling across the dashboard
 * Addresses BUG #11676 - Frontend error handling misalignment with backend responses
 */

export interface BackendErrorDetail {
  error: string;
  message: string;
  query?: string;
  timestamp?: string;
  error_id?: string;
  [key: string]: any;
}

export interface BackendErrorResponse {
  detail: BackendErrorDetail | string;
}

export interface ParsedError {
  type: 'validation' | 'network' | 'server' | 'auth' | 'unknown';
  code: string;
  message: string;
  userMessage: string;
  originalQuery?: string;
  retryable: boolean;
  statusCode: number;
  timestamp?: string;
  errorId?: string;
}

export interface QueryValidationError extends ParsedError {
  type: 'validation';
  suggestions?: string[];
}

export interface NetworkError extends ParsedError {
  type: 'network';
  retryable: true;
}

export interface ServerError extends ParsedError {
  type: 'server';
  errorId?: string;
}

export interface AuthError extends ParsedError {
  type: 'auth';
  retryable: false;
}

// Error display props for UI components
export interface ErrorDisplayProps {
  error: ParsedError;
  onRetry?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export interface ValidationErrorProps extends ErrorDisplayProps {
  error: QueryValidationError;
  onSuggestionClick: (suggestion: string) => void;
}

export interface NetworkErrorProps extends ErrorDisplayProps {
  error: NetworkError;
  onRetry: () => void;
}

// Error categories for different handling strategies
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network', 
  SERVER = 'server',
  AUTH = 'auth',
  UNKNOWN = 'unknown'
}

// Common error codes from backend
export enum BackendErrorCode {
  NON_BUSINESS_QUERY = 'non_business_query',
  INVALID_FOLLOWUP_QUERY = 'invalid_followup_query',
  INVALID_QUERY = 'invalid_query',
  PROJECT_NOT_FOUND = 'project_not_found',
  QUERY_MANAGER_NOT_INITIALIZED = 'query_manager_not_initialized',
  SERVER_ERROR = 'server_error',
  AUTHENTICATION_FAILED = 'authentication_failed',
  FILE_UPLOAD_FAILED = 'file_upload_failed',
  FILE_PROCESSING_FAILED = 'file_processing_failed'
}
