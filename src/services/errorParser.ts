/**
 * Unified error parser for handling backend error responses
 * Addresses BUG #11676 - Frontend error handling misalignment with backend responses
 */

import { 
  ParsedError, 
  BackendErrorResponse, 
  BackendErrorDetail, 
  ErrorCategory, 
  BackendErrorCode,
  QueryValidationError,
  NetworkError,
  ServerError,
  AuthError
} from '../types/errors';

export class BackendErrorParser {
  /**
   * Parse any error from backend into structured format
   */
  static parseError(error: any, response?: Response): ParsedError {
    // Handle HTTPException format (FastAPI standard)
    if (response && !response.ok) {
      return this.parseHTTPException(error, response);
    }
    
    // Handle strategy agent error format (direct object response)
    if (error && typeof error === 'object' && error.error && error.status) {
      return this.parseStrategyAgentError(error);
    }
    
    // Handle network/connection errors
    if (error instanceof TypeError || error.message?.includes('fetch')) {
      return this.parseNetworkError(error);
    }
    
    // Handle generic errors
    return this.parseGenericError(error);
  }

  /**
   * Parse FastAPI HTTPException responses
   */
  private static parseHTTPException(error: any, response: Response): ParsedError {
    const statusCode = response.status;
    let detail: any = null;
    
    try {
      // Try to parse error message as JSON (FastAPI format)
      detail = JSON.parse(error.message);
    } catch {
      // If not JSON, treat as simple string
      detail = { message: error.message };
    }
    
    // Handle FastAPI HTTPException format
    if (detail.detail) {
      if (typeof detail.detail === 'string') {
        // Simple string detail
        return {
          type: this.getErrorType(statusCode),
          code: 'http_exception',
          message: detail.detail,
          userMessage: this.getUserFriendlyMessage(detail.detail),
          retryable: this.isRetryable(statusCode),
          statusCode
        };
      } else {
        // Structured error detail
        const errorDetail = detail.detail;
        return {
          type: this.getErrorType(statusCode, errorDetail.error),
          code: errorDetail.error || 'unknown',
          message: errorDetail.message || errorDetail.error || 'Unknown error',
          userMessage: errorDetail.message || this.getUserFriendlyMessage(errorDetail.error),
          originalQuery: errorDetail.query,
          retryable: this.isRetryable(statusCode),
          statusCode,
          timestamp: errorDetail.timestamp,
          errorId: errorDetail.error_id
        };
      }
    }
    
    return this.parseGenericError(error);
  }

  /**
   * Parse strategy agent error responses (direct object format)
   */
  private static parseStrategyAgentError(error: any): ParsedError {
    return {
      type: 'validation',
      code: error.error,
      message: error.response || error.message,
      userMessage: error.response || error.message,
      originalQuery: error.query,
      retryable: false,
      statusCode: 400
    };
  }

  /**
   * Parse network/connection errors
   */
  private static parseNetworkError(error: any): NetworkError {
    return {
      type: 'network',
      code: 'network_error',
      message: error.message || 'Network connection failed',
      userMessage: 'Connection issue. Please check your internet connection and try again.',
      retryable: true,
      statusCode: 0
    };
  }

  /**
   * Parse generic errors
   */
  private static parseGenericError(error: any): ParsedError {
    return {
      type: 'unknown',
      code: 'unknown_error',
      message: error.message || 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again.',
      retryable: false,
      statusCode: 0
    };
  }

  /**
   * Determine error type based on status code and error code
   */
  private static getErrorType(statusCode: number, errorCode?: string): ErrorCategory {
    // Authentication errors
    if (statusCode === 401 || statusCode === 403) {
      return ErrorCategory.AUTH;
    }
    
    // Validation errors
    if (statusCode === 400) {
      if (errorCode && [
        BackendErrorCode.NON_BUSINESS_QUERY,
        BackendErrorCode.INVALID_FOLLOWUP_QUERY,
        BackendErrorCode.INVALID_QUERY
      ].includes(errorCode as BackendErrorCode)) {
        return ErrorCategory.VALIDATION;
      }
      return ErrorCategory.VALIDATION;
    }
    
    // Server errors
    if (statusCode >= 500) {
      return ErrorCategory.SERVER;
    }
    
    // Network errors
    if (statusCode === 0 || statusCode >= 1000) {
      return ErrorCategory.NETWORK;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Check if error is retryable
   */
  private static isRetryable(statusCode: number): boolean {
    // Network errors are retryable
    if (statusCode === 0) return true;
    
    // Server errors (5xx) are retryable
    if (statusCode >= 500) return true;
    
    // Rate limiting (429) is retryable
    if (statusCode === 429) return true;
    
    // Validation errors (4xx) are not retryable
    if (statusCode >= 400 && statusCode < 500) return false;
    
    return false;
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      [BackendErrorCode.NON_BUSINESS_QUERY]: 'This query is not related to business strategy. Please ask about business topics like market analysis, competitive positioning, or strategic planning.',
      [BackendErrorCode.INVALID_FOLLOWUP_QUERY]: 'This follow-up question is not related to the business analysis. Please ask questions about the report findings or request additional analysis.',
      [BackendErrorCode.INVALID_QUERY]: 'Please provide a more specific business question. Try asking about market trends, competitive analysis, or strategic opportunities.',
      [BackendErrorCode.PROJECT_NOT_FOUND]: 'The requested project could not be found. It may have been deleted or you may not have access to it.',
      [BackendErrorCode.QUERY_MANAGER_NOT_INITIALIZED]: 'The system is temporarily unavailable. Please try again in a moment.',
      [BackendErrorCode.SERVER_ERROR]: 'A server error occurred. Our team has been notified and is working to fix it.',
      [BackendErrorCode.AUTHENTICATION_FAILED]: 'Authentication failed. Please log in again.',
      [BackendErrorCode.FILE_UPLOAD_FAILED]: 'File upload failed. Please check the file format and size, then try again.',
      [BackendErrorCode.FILE_PROCESSING_FAILED]: 'File processing failed. The file may be corrupted or in an unsupported format.'
    };
    
    return messages[errorCode] || 'An error occurred. Please try again.';
  }

  /**
   * Get validation suggestions for specific error codes
   */
  static getValidationSuggestions(errorCode: string): string[] {
    const suggestions: Record<string, string[]> = {
      [BackendErrorCode.NON_BUSINESS_QUERY]: [
        'Analyze our market position in digital banking',
        'Assess growth opportunities in SME lending',
        'Compare our competitive advantages',
        'Evaluate digital transformation strategies',
        'Review customer satisfaction trends'
      ],
      [BackendErrorCode.INVALID_FOLLOWUP_QUERY]: [
        'Can you provide more detail on the market analysis?',
        'What are the key recommendations from this report?',
        'How does this compare to industry benchmarks?',
        'What are the next steps for implementation?',
        'Can you expand on the risk assessment?'
      ],
      [BackendErrorCode.INVALID_QUERY]: [
        'Analyze market trends in the UAE banking sector',
        'Assess competitive positioning against regional banks',
        'Evaluate digital banking adoption rates',
        'Review customer acquisition strategies',
        'Compare financial performance metrics'
      ]
    };
    
    return suggestions[errorCode] || [];
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: ParsedError): error is QueryValidationError {
    return error.type === 'validation';
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: ParsedError): error is NetworkError {
    return error.type === 'network';
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: ParsedError): error is ServerError {
    return error.type === 'server';
  }

  /**
   * Check if error is an auth error
   */
  static isAuthError(error: ParsedError): error is AuthError {
    return error.type === 'auth';
  }
}
