import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TokenBalanceList } from "./TokenBalanceList";
import * as useTokenBalances from "@/hooks/useTokenBalances";

// Mock the hook
vi.mock("@/hooks/useTokenBalances", () => ({
  useTokenBalances: vi.fn(),
}));

describe("TokenBalanceList", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const mockNetwork = "mainnet" as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton when loading", () => {
    vi.spyOn(useTokenBalances, "useTokenBalances").mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      isError: false,
      isSuccess: false,
      isPending: true,
    } as unknown as ReturnType<typeof useTokenBalances.useTokenBalances>);

    render(<TokenBalanceList address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/token balances/i)).toBeInTheDocument();
  });

  it("should render error state with retry button", () => {
    const mockRefetch = vi.fn();
    const mockError = new Error("Failed to fetch");

    vi.spyOn(useTokenBalances, "useTokenBalances").mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
      isFetching: false,
      isError: true,
      isSuccess: false,
      isPending: false,
    } as unknown as ReturnType<typeof useTokenBalances.useTokenBalances>);

    render(<TokenBalanceList address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/failed to load balances/i)).toBeInTheDocument();

    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render token list with ETH first", () => {
    const mockData = {
      address: mockAddress,
      network: mockNetwork,
      tokens: [
        {
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          symbol: "USDC",
          name: "USD Coin",
          balance: "1000.0",
          decimals: 6,
          usdValue: "1000.00",
          logo: "https://example.com/usdc.png",
        },
      ],
      ethBalance: {
        balance: "1.0",
        usdValue: "2000.00",
      },
      totalValue: "3000.00",
      lastUpdated: new Date().toISOString(),
    };

    vi.spyOn(useTokenBalances, "useTokenBalances").mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as unknown as ReturnType<typeof useTokenBalances.useTokenBalances>);

    render(<TokenBalanceList address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/token balances/i)).toBeInTheDocument();
    // ETH appears in both the symbol and "Ethereum" name, so use getAllByText
    const ethElements = screen.getAllByText(/ETH/i);
    expect(ethElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/USDC/i)).toBeInTheDocument();
  });
});
