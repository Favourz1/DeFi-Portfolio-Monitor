import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/constants";
import { ApiResponse, ApiError } from "@/types/api.types";
import {
  isOnline,
  isNetworkError,
  logError,
  getErrorMessage,
} from "@/utils/error";

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

  // Response interceptor with enhanced error handling
  client.interceptors.response.use(
    (response) => {
      // API returns standardized format, extract data
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      // Log error for debugging
      logError(error, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      });

      if (error.response) {
        // Server responded with error
        const apiError = error.response.data;
        const message = getErrorMessage(
          new Error(apiError?.message || "An error occurred")
        );
        throw new ApiRequestError(message, error.response.status, error);
      } else if (error.request) {
        // Request made but no response (network error)
        if (!isOnline()) {
          throw new ApiRequestError(
            "You appear to be offline. Please check your internet connection.",
            0,
            error
          );
        }
        const message = getErrorMessage(error);
        throw new ApiRequestError(message, 0, error);
      } else {
        // Something else happened
        const message = getErrorMessage(error);
        throw new ApiRequestError(message, 0, error);
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
