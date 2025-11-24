/**
 * Standardized API response format for all endpoints
 *
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /** Indicates if the response is an error (true) or success (false) */
  error: boolean;

  /** Message describing the result */
  message: string;

  /** HTTP status code */
  statusCode: number;

  /** Response data (null on error) */
  data: T | null;

  /** ISO 8601 timestamp of the response */
  timestamp?: string;
}
