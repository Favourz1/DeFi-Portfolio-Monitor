import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider, RainbowKitWithTheme } from "@/components/Layout";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/Layout/ErrorBoundary";
import { Home } from "@/pages/Home";
import { config } from "@/config/wagmi.config";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

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
 */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ThemeProvider>
            <RainbowKitWithTheme>
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
