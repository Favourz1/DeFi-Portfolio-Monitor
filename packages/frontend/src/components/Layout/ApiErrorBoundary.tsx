import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { ApiRequestError } from "@/services/api/client";
import { isRateLimitError } from "@/utils/error";

/**
 * Props for ApiErrorBoundary component
 */
interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

/**
 * State for ApiErrorBoundary component
 */
interface State {
  hasError: boolean;
  error: Error | null;
  isRateLimit: boolean;
}

/**
 * Error boundary specifically for API failures
 *
 * @remarks
 * Catches API errors and displays user-friendly messages with retry options.
 * Handles rate limiting errors with specific messaging.
 */
export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRateLimit: false,
    };
  }

  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    const isRateLimit =
      isRateLimitError(error) ||
      (error instanceof ApiRequestError && error.statusCode === 429);

    return {
      hasError: true,
      error,
      isRateLimit,
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("ApiErrorBoundary caught an error:", error);
      console.error("Error info:", errorInfo);
    }
  }

  /**
   * Retry mechanism to reset error state
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isRateLimit: false,
    });

    // Call optional retry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  /**
   * Dismiss error
   */
  private handleDismiss = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isRateLimit: false,
    });
  };

  render(): ReactNode {
    const { hasError, error, isRateLimit } = this.state;
    const { children } = this.props;

    if (hasError && error) {
      return (
        <Card className="m-4 border-destructive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">
                  {isRateLimit ? "Rate Limit Exceeded" : "API Error"}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleDismiss}
                className="h-6 w-6 p-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                {isRateLimit
                  ? "Too many requests. Please wait a moment before trying again."
                  : error.message || "An API error occurred. Please try again."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex-1 cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button
                onClick={this.handleDismiss}
                variant="outline"
                className="cursor-pointer"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}
