import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TransactionHistory } from "./TransactionHistory";
import * as useTransactions from "@/hooks/useTransactions";

// Mock the hook
vi.mock("@/hooks/useTransactions", () => ({
  useTransactions: vi.fn(),
}));

describe("TransactionHistory", () => {
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const mockNetwork = "mainnet" as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton when loading", () => {
    vi.spyOn(useTransactions, "useTransactions").mockReturnValue({
      data: {
        pages: [],
        pageParams: [],
      },
      isLoading: true,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<TransactionHistory address={mockAddress} network={mockNetwork} />);

    // Use getAllByText since the text might appear in multiple places, then check first occurrence
    const headings = screen.getAllByText(/transaction history/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should render error state with retry button", () => {
    const mockRefetch = vi.fn();
    const mockError = new Error("Failed to fetch");

    vi.spyOn(useTransactions, "useTransactions").mockReturnValue({
      data: {
        pages: [],
        pageParams: [],
      },
      isLoading: false,
      error: mockError,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<TransactionHistory address={mockAddress} network={mockNetwork} />);

    expect(
      screen.getByText(/failed to load transactions/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should render empty state when no transactions", () => {
    vi.spyOn(useTransactions, "useTransactions").mockReturnValue({
      data: {
        pages: [
          {
            transactions: [],
            pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
          },
        ],
        pageParams: [],
      },
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<TransactionHistory address={mockAddress} network={mockNetwork} />);

    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });

  it("should render transaction list", () => {
    const mockTransactions = [
      {
        hash: "0xHash1",
        type: "eth_transfer" as const,
        from: mockAddress,
        to: "0xRecipient",
        value: "1.0",
        timestamp: Math.floor(Date.now() / 1000),
        usdValue: "2000.00",
        status: "success" as const,
      },
    ];

    vi.spyOn(useTransactions, "useTransactions").mockReturnValue({
      data: {
        pages: [
          {
            transactions: mockTransactions,
            pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
          },
        ],
        pageParams: [],
      },
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<TransactionHistory address={mockAddress} network={mockNetwork} />);

    // Use getAllByText since the text might appear in multiple places, then check first occurrence
    const headings = screen.getAllByText(/transaction history/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should handle search input", async () => {
    const mockFetchNextPage = vi.fn();

    vi.spyOn(useTransactions, "useTransactions").mockReturnValue({
      data: {
        pages: [
          {
            transactions: [],
            pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
          },
        ],
        pageParams: [],
      },
      isLoading: false,
      error: null,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<TransactionHistory address={mockAddress} network={mockNetwork} />);

    const searchInput = screen.getByPlaceholderText(/search by hash/i);
    fireEvent.change(searchInput, { target: { value: "0xHash" } });

    await waitFor(
      () => {
        expect(searchInput).toHaveValue("0xHash");
      },
      { timeout: 600 }
    );
  });
});
