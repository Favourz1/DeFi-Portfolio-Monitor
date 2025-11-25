import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Props for ErrorBoundary component
 */
interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * State for ErrorBoundary component
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default fallback component for errors
 */
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-xl">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm text-muted-foreground font-mono">
            {error.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={retry} className="w-full cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full cursor-pointer"
          >
            Reload Page
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          If this problem persists, please refresh the page or contact support.
        </p>
      </CardContent>
    </Card>
  </div>
);

/**
 * Error boundary component that catches React errors and displays fallback UI
 *
 * @remarks
 * Provides error recovery mechanisms including retry functionality
 * and automatic error reporting for debugging purposes
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    // console.error("ErrorBoundary caught an error:", error);
    // console.error("Error info:", errorInfo);
  }

  /**
   * Retry mechanism to reset error state
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback: CustomFallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided, otherwise use default
      if (CustomFallback) {
        return <CustomFallback error={error} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={error} retry={this.handleRetry} />;
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 *
 * @param children - Child components to wrap
 * @param fallback - Optional custom fallback component
 * @returns ErrorBoundary wrapper
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
