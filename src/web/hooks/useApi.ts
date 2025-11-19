import { apiRequest, ApiResponse } from '../services/api';

/**
 * Hook for making authenticated API requests
 * This is a convenience wrapper around apiRequest that can be extended
 * with additional functionality like loading states, error handling, etc.
 */
export function useApi() {
  /**
   * Make an authenticated API request
   */
  const request = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, options);
  };

  return { request };
}

