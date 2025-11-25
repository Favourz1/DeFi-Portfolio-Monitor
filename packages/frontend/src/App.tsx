import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/Layout/ThemeProvider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/Layout/ErrorBoundary";
import { Home } from "@/pages/Home";

/**
 * React Query client configuration
 *
 * @remarks
 * Configured with optimized defaults:
 * - 30s stale time for fresh data
 * - 5min cache time for offline capability
 * - No refetch on window focus to reduce API calls
 * - 2 retries for resilience
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (garbage collection time)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

/**
 * Main App component with all providers and global setup
 *
 * @remarks
 * Sets up the application with:
 * - Error boundary for React error catching
 * - React Query for server state management
 * - Theme provider for dark/light mode
 * - Toast notifications
 * - Main home page content
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Home />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
