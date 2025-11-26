import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider, RainbowKitWithTheme } from "@/components/Layout";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/Layout/ErrorBoundary";
import { OfflineIndicator } from "@/components/Layout/OfflineIndicator";
import { Home } from "@/pages/Home";
import { config } from "@/config/wagmi.config";
import { isOnline, calculateBackoffDelay } from "@/utils/error";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

/**
 * React Query client configuration with enhanced retry logic
 *
 * @remarks
 * Configured with optimized defaults:
 * - 30s stale time for fresh data
 * - 5min cache time for offline capability
 * - No refetch on window focus to reduce API calls
 * - Exponential backoff retry with max 3 attempts
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (garbage collection time)
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!isOnline()) {
          return false;
        }
        // Retry up to 3 times with exponential backoff
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => calculateBackoffDelay(attemptIndex),
    },
  },
});

/**
 * Main App component with all providers and global setup
 *
 * @remarks
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ThemeProvider>
            <RainbowKitWithTheme>
              <OfflineIndicator />
              <Home />
              <Toaster
                position="top-center"
                richColors
                closeButton
                duration={4000}
              />
            </RainbowKitWithTheme>
          </ThemeProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
