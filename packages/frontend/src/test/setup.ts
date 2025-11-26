// Test setup file for Vitest
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Wagmi v2 hooks
vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({
    address: undefined,
    isConnected: false,
  })),
  useChainId: vi.fn(() => 1),
  useSwitchChain: vi.fn(() => ({
    switchChain: vi.fn(),
    isPending: false,
  })),
  useDisconnect: vi.fn(() => ({
    disconnect: vi.fn(),
  })),
  WagmiProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock RainbowKit
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => React.createElement("button", null, "Connect Wallet"),
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  darkTheme: vi.fn(),
  lightTheme: vi.fn(),
}));

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useInfiniteQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
  })),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
