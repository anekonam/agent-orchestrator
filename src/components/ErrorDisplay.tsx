/**
 * Error display components for unified error handling
 * Addresses BUG #11676 - Frontend error handling misalignment with backend responses
 */

import React from 'react';
import { 
  ParsedError, 
  QueryValidationError, 
  NetworkError, 
  ServerError, 
  AuthError,
  ErrorDisplayProps,
  ValidationErrorProps,
  NetworkErrorProps,
  BackendErrorCode
} from '../types/errors';
import { BackendErrorParser } from '../services/errorParser';

/**
 * Parse error from JSON string (used when errors are thrown as JSON strings)
 */
export const parseErrorFromString = (errorString: string): ParsedError | null => {
  try {
    return JSON.parse(errorString);
  } catch {
    return null;
  }
};

/**
 * Main error display component that routes to specific error types
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onSuggestionClick, 
  className = '' 
}) => {
  if (BackendErrorParser.isValidationError(error)) {
    return (
      <ValidationErrorDisplay 
        error={error} 
        onSuggestionClick={onSuggestionClick || (() => {})}
        className={className}
      />
    );
  }
  
  if (BackendErrorParser.isNetworkError(error)) {
    return (
      <NetworkErrorDisplay 
        error={error} 
        onRetry={onRetry || (() => {})}
        className={className}
      />
    );
  }
  
  if (BackendErrorParser.isServerError(error)) {
    return (
      <ServerErrorDisplay 
        error={error} 
        onRetry={onRetry}
        className={className}
      />
    );
  }
  
  if (BackendErrorParser.isAuthError(error)) {
    return (
      <AuthErrorDisplay 
        error={error} 
        className={className}
      />
    );
  }
  
  return (
    <GenericErrorDisplay 
      error={error} 
      onRetry={onRetry}
      className={className}
    />
  );
};

/**
 * Validation error display with suggestions
 */
export const ValidationErrorDisplay: React.FC<ValidationErrorProps> = ({ 
  error, 
  onSuggestionClick, 
  className = '' 
}) => {
  const suggestions = BackendErrorParser.getValidationSuggestions(error.code);
  
  return (
    <div className={`validation-error p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Query Not Suitable for Business Analysis
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            {error.userMessage}
          </div>
          {suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Try asking about:
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="block w-full text-left px-3 py-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded border border-yellow-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Network error display with retry option
 */
export const NetworkErrorDisplay: React.FC<NetworkErrorProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`network-error p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Connection Issue
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error.userMessage}
          </div>
          {error.retryable && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Server error display
 */
export const ServerErrorDisplay: React.FC<{ 
  error: ServerError; 
  onRetry?: () => void; 
  className?: string; 
}> = ({ error, onRetry, className = '' }) => {
  return (
    <div className={`server-error p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Server Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error.userMessage}
          </div>
          {error.errorId && (
            <div className="mt-2 text-xs text-red-600">
              Error ID: {error.errorId}
            </div>
          )}
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Authentication error display
 */
export const AuthErrorDisplay: React.FC<{ 
  error: AuthError; 
  className?: string; 
}> = ({ error, className = '' }) => {
  return (
    <div className={`auth-error p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Authentication Required
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error.userMessage}
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generic error display for unknown error types
 */
export const GenericErrorDisplay: React.FC<{ 
  error: ParsedError; 
  onRetry?: () => void; 
  className?: string; 
}> = ({ error, onRetry, className = '' }) => {
  return (
    <div className={`generic-error p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-800">
            Something went wrong
          </h3>
          <div className="mt-2 text-sm text-gray-700">
            {error.userMessage}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Error toast component for temporary error messages
 */
export const ErrorToast: React.FC<{ 
  message: string; 
  onClose: () => void; 
  type?: 'error' | 'warning' | 'info';
}> = ({ message, onClose, type = 'error' }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
