import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL } from "@/config/constants";
import { ApiResponse, ApiError } from "@/types/api.types";

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

/**
 * Create configured Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add any auth headers here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // API returns standardized format, extract data
      return response;
    },
    (error: AxiosError<ApiError>) => {
      if (error.response) {
        // Server responded with error
        const apiError = error.response.data;
        throw new ApiRequestError(
          apiError?.message || "An error occurred",
          error.response.status,
          error
        );
      } else if (error.request) {
        // Request made but no response
        throw new ApiRequestError(
          "Network error: Unable to reach server",
          0,
          error
        );
      } else {
        // Something else happened
        throw new ApiRequestError(
          error.message || "An unexpected error occurred",
          0,
          error
        );
      }
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Type-safe API request wrapper
 *
 * @template T - Expected data type
 * @param promise - Axios promise
 * @returns Unwrapped data or throws error
 */
export async function unwrapApiResponse<T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> {
  const response = await promise;

  if (response.data.error) {
    throw new ApiRequestError(response.data.message, response.data.statusCode);
  }

  if (response.data.data === null) {
    throw new ApiRequestError(
      "No data returned from API",
      response.data.statusCode
    );
  }

  return response.data.data;
}
