import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TokenBalanceItem } from "./TokenBalanceItem";
import type { TokenBalance } from "@/types/token.types";

describe("TokenBalanceItem", () => {
  const mockToken: TokenBalance = {
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    balance: "1000.0",
    decimals: 6,
    usdValue: "1000.00",
    logo: "https://example.com/usdc.png",
  };

  it("should render token information correctly", () => {
    render(<TokenBalanceItem token={mockToken} />);

    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText(/USD Coin/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,000.00/i)).toBeInTheDocument();
  });

  it("should render token logo when provided", () => {
    render(<TokenBalanceItem token={mockToken} />);

    const logo = screen.getByAltText("USDC logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", mockToken.logo);
  });

  it("should render fallback placeholder when no logo", () => {
    const tokenWithoutLogo: TokenBalance = {
      ...mockToken,
      logo: undefined,
    };

    render(<TokenBalanceItem token={tokenWithoutLogo} />);

    expect(screen.getByText("US")).toBeInTheDocument(); // First 2 letters of USDC
  });

  it("should format token balance correctly", () => {
    render(<TokenBalanceItem token={mockToken} />);

    expect(screen.getByText(/1,000.0/i)).toBeInTheDocument();
  });

  it("should display contract address", () => {
    render(<TokenBalanceItem token={mockToken} />);

    expect(screen.getByText(mockToken.contractAddress)).toBeInTheDocument();
  });
});
