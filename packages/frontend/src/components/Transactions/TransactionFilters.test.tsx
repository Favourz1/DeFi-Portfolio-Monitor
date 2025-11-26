import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TransactionFilters } from "./TransactionFilters";

describe("TransactionFilters", () => {
  const mockOnSearchChange = vi.fn();
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input and filter dropdown", () => {
    render(
      <TransactionFilters
        onSearchChange={mockOnSearchChange}
        onFilterChange={mockOnFilterChange}
        isLoading={false}
      />
    );

    expect(screen.getByPlaceholderText(/search by hash/i)).toBeInTheDocument();
    expect(screen.getByText(/all transactions/i)).toBeInTheDocument();
  });

  it("should debounce search input", async () => {
    vi.useFakeTimers();

    render(
      <TransactionFilters
        onSearchChange={mockOnSearchChange}
        onFilterChange={mockOnFilterChange}
        isLoading={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by hash/i);
    fireEvent.change(searchInput, { target: { value: "0xHash" } });

    expect(mockOnSearchChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith("0xHash");
    });

    vi.useRealTimers();
  });

  it("should call onFilterChange when filter is changed", () => {
    render(
      <TransactionFilters
        onSearchChange={mockOnSearchChange}
        onFilterChange={mockOnFilterChange}
        isLoading={false}
      />
    );

    // Open select
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Select "Sent" option
    const sentOption = screen.getByText(/sent/i);
    fireEvent.click(sentOption);

    expect(mockOnFilterChange).toHaveBeenCalledWith("sent");
  });

  it("should disable inputs when loading", () => {
    render(
      <TransactionFilters
        onSearchChange={mockOnSearchChange}
        onFilterChange={mockOnFilterChange}
        isLoading={true}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search by hash/i);
    const select = screen.getByRole("combobox");

    expect(searchInput).toBeDisabled();
    expect(select).toBeDisabled();
  });
});
