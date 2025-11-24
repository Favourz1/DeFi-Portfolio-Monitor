/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  statusCode: number;
  data: T | null;
  timestamp?: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: true;
  message: string;
  statusCode: number;
  data: null;
  timestamp: string;
}
