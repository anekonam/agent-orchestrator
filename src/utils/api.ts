import { API_CONFIG } from '../config/api';

// Debug helper to log API configuration
export const logApiConfig = () => {
  if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
    console.log('🔧 API Configuration:', {
      baseUrl: API_CONFIG.BASE_URL,
      endpoints: API_CONFIG.ENDPOINTS,
      environment: process.env.REACT_APP_ENV || 'development',
    });
  }
};

// Common API request headers
export const getApiHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

// Helper for handling API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
};