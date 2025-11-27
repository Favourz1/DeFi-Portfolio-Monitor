/**
 * Error handling utilities
 */

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

/**
 * Calculate exponential backoff delay
 *
 * @param attemptIndex - Current attempt index (0-based)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @param maxDelay - Maximum delay in milliseconds (default: 30000)
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(
  attemptIndex: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return Math.floor(delay + jitter);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Network error") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT")
    );
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("timeout") ||
      error.message.includes("TIMEDOUT") ||
      error.name === "TimeoutError"
    );
  }
  return false;
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("429") ||
      error.message.includes("rate limit") ||
      error.message.includes("Too many requests") ||
      (error as { statusCode?: number }).statusCode === 429
    );
  }
  return false;
}

/**
 * Get retry-after delay from rate limit error (if available)
 */
export function getRetryAfterDelay(error: unknown): number | null {
  if (error instanceof Error && "response" in error) {
    const axiosError = error as {
      response?: { headers?: { "retry-after"?: string } };
    };
    const retryAfter = axiosError.response?.headers?.["retry-after"];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000; // Convert to milliseconds
      }
    }
  }
  return null;
}

/**
 * Log error for debugging
 *
 * @param error - Error to log
 * @param context - Additional context information
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Error occurred:", {
      error,
      context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
      online: typeof window !== "undefined" ? navigator.onLine : undefined,
    });
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (isNetworkError(error)) {
      if (!isOnline()) {
        return "You appear to be offline. Please check your internet connection.";
      }
      return "Network error: Unable to reach server. Please try again.";
    }

    // Timeout errors
    if (isTimeoutError(error)) {
      return "Request timed out. Please try again.";
    }

    // Rate limit errors with retry-after information
    if (isRateLimitError(error)) {
      const retryAfter = getRetryAfterDelay(error);
      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60000);
        return `Too many requests. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`;
      }
      return "Too many requests. Please wait a moment and try again.";
    }

    // Server errors
    if (error.message.includes("500") || error.message.includes("503")) {
      return "Server error. Please try again later.";
    }

    // Return the error message if it's user-friendly
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
