import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PortfolioOverview } from "./PortfolioOverview";
import * as usePortfolio from "@/hooks/usePortfolio";

// Mock the hook
vi.mock("@/hooks/usePortfolio", () => ({
  usePortfolio: vi.fn(),
}));

describe("PortfolioOverview", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const mockNetwork = "mainnet" as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton when loading", () => {
    vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      isError: false,
      isSuccess: false,
      isPending: true,
    } as unknown as ReturnType<typeof usePortfolio.usePortfolio>);

    render(<PortfolioOverview address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/portfolio overview/i)).toBeInTheDocument();
  });

  it("should render error state with retry button", () => {
    const mockRefetch = vi.fn();
    const mockError = new Error("Failed to fetch");

    vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
      isFetching: false,
      isError: true,
      isSuccess: false,
      isPending: false,
    } as unknown as ReturnType<typeof usePortfolio.usePortfolio>);

    render(<PortfolioOverview address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/failed to load portfolio/i)).toBeInTheDocument();

    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render portfolio data correctly", () => {
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

    const mockRefetch = vi.fn();

    vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as unknown as ReturnType<typeof usePortfolio.usePortfolio>);

    render(<PortfolioOverview address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/portfolio overview/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3,000.00/i)).toBeInTheDocument();
    expect(screen.getByText(/eth balance/i)).toBeInTheDocument();
    expect(screen.getByText(/tokens/i)).toBeInTheDocument();

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should show network badge correctly", () => {
    const mockData = {
      address: mockAddress,
      network: "sepolia" as const,
      tokens: [],
      ethBalance: {
        balance: "0.0",
        usdValue: "0.00",
      },
      totalValue: "0.00",
      lastUpdated: new Date().toISOString(),
    };

    vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      isError: false,
      isSuccess: true,
      isPending: false,
    } as unknown as ReturnType<typeof usePortfolio.usePortfolio>);

    render(<PortfolioOverview address={mockAddress} network="sepolia" />);

    expect(screen.getByText(/sepolia testnet/i)).toBeInTheDocument();
  });
});
