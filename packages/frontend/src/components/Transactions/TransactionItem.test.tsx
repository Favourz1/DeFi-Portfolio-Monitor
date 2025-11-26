import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TransactionItem } from "./TransactionItem";
import type { Transaction } from "@/types/transaction.types";

describe("TransactionItem", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const mockNetwork = "mainnet" as const;

  const mockEthTransaction: Transaction = {
    hash: "0xHash1",
    type: "eth_transfer",
    from: "0xSender",
    to: mockAddress,
    value: "1.0",
    timestamp: Math.floor(Date.now() / 1000),
    usdValue: "2000.00",
    status: "success",
    blockNumber: 12345678,
    gasUsed: "21000",
    gasPrice: "20000000000",
  };

  const mockTokenTransaction: Transaction = {
    hash: "0xHash2",
    type: "erc20_transfer",
    from: mockAddress,
    to: "0xRecipient",
    value: "1000.0",
    tokenSymbol: "USDC",
    tokenName: "USD Coin",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    timestamp: Math.floor(Date.now() / 1000),
    usdValue: "1000.00",
    status: "success",
    blockNumber: 12345679,
    gasUsed: "65000",
    gasPrice: "20000000000",
  };

  it("should render token transaction correctly", () => {
    render(
      <TransactionItem
        transaction={mockTokenTransaction}
        currentAddress={mockAddress}
        network={mockNetwork}
      />
    );

    expect(screen.getByText(/sent/i)).toBeInTheDocument();
    // USDC appears in both mobile and desktop views, so use getAllByText
    const usdcElements = screen.getAllByText(/USDC/i);
    expect(usdcElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/USD Coin/i)).toBeInTheDocument();
  });

  it("should show correct direction for incoming transaction", () => {
    render(
      <TransactionItem
        transaction={mockEthTransaction}
        currentAddress={mockAddress}
        network={mockNetwork}
      />
    );

    expect(screen.getByText(/received/i)).toBeInTheDocument();
  });

  it("should show correct direction for outgoing transaction", () => {
    render(
      <TransactionItem
        transaction={mockTokenTransaction}
        currentAddress={mockAddress}
        network={mockNetwork}
      />
    );

    expect(screen.getByText(/sent/i)).toBeInTheDocument();
  });

  it("should render status badge", () => {
    render(
      <TransactionItem
        transaction={mockEthTransaction}
        currentAddress={mockAddress}
        network={mockNetwork}
      />
    );

    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });

  it("should render block explorer link", () => {
    render(
      <TransactionItem
        transaction={mockEthTransaction}
        currentAddress={mockAddress}
        network={mockNetwork}
      />
    );

    // "View" appears in desktop view, "View on Explorer" in mobile view
    // Query by role to get the link directly
    const links = screen.getAllByRole("link");
    const explorerLink = links.find((link) =>
      link.getAttribute("href")?.includes("etherscan.io")
    );
    expect(explorerLink).toBeInTheDocument();
    expect(explorerLink).toHaveAttribute("href");
    expect(explorerLink).toHaveAttribute("target", "_blank");
  });
});
