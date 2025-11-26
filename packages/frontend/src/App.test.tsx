import { render, screen } from "@testing-library/react";
import { vi, beforeEach } from "vitest";
import App from "./App";

// ---- Setup window.matchMedia mock ----
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// ---- Mock fixes ----
// Mock next-themes to avoid matchMedia issues
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
    systemTheme: "light",
  }),
}));

// Mock useWallet hook since Home component uses it
vi.mock("@/hooks/useWallet", () => ({
  useWallet: vi.fn(() => ({
    isConnected: false,
    address: null,
    network: "mainnet" as const,
    isManualMode: false,
    clearManualAddress: vi.fn(),
    chainId: null,
    isWalletConnected: false,
    isSwitchingChain: false,
    switchNetwork: vi.fn(),
    disconnect: vi.fn(),
    setManualAddress: vi.fn(),
    isConnecting: false,
    error: null,
    isMetaMaskInstalled: true,
  })),
}));

// Mock wagmi so that createConfig and anything using ssr is safe
vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    // createConfig needed for App import
    createConfig: vi.fn(() => ({})),
    // Mock WagmiProvider to a passthrough so `config` (which depends on ssr) isn't evaluated
    WagmiProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    // Cover any other ssr-dependent utilities if needed
  };
});

// Mock rainbowkit because @components/Layout uses RainbowKit components (may depend on wagmi internals)
// IMPORTANT: Mock all exports used by components
vi.mock("@rainbow-me/rainbowkit", () => {
  return {
    RainbowKitProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    ConnectButton: () => <button>Connect Wallet</button>,
    // Theme functions used in RainbowKitProvider
    lightTheme: () => ({}),
    darkTheme: () => ({}),
  };
});

// Mock the Toaster for sonner
vi.mock("sonner", () => ({
  Toaster: () => null,
}));

// ---- Test ----

describe("App", () => {
  it("renders the main heading (mobile and desktop)", () => {
    render(<App />);

    // Check for the main heading text - it appears in both mobile and desktop layouts
    // The text "DeFi Portfolio Tracker" should be present in at least one h1 element
    const headings = screen.getAllByRole("heading", { level: 1 });
    const hasMainHeading = headings.some((heading) =>
      heading.textContent?.includes("DeFi Portfolio Tracker")
    );
    expect(hasMainHeading).toBe(true);
  });
});
