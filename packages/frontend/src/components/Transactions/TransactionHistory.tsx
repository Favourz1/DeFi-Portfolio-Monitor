import { useState } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionItem } from "./TransactionItem";
import { LoadingSkeleton } from "@/components/Loading/LoadingSkeleton";
import { useTransactions } from "@/hooks/useTransactions";
import { Network } from "@/types/wallet.types";
import { TransactionFilterType } from "@/types/transaction.types";

interface TransactionHistoryProps {
  address: string;
  network: Network;
}

/**
 * Transaction history component with infinite scroll and filtering
 *
 * @remarks
 * Displays paginated transaction history with search and filter capabilities.
 * Includes loading states, error handling, and empty state messaging.
 */
export function TransactionHistory({
  address,
  network,
}: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<TransactionFilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useTransactions({
    address,
    network,
    type: filterType,
    search: searchTerm,
    limit: 20,
  });

  // Flatten all pages of transactions
  const allTransactions =
    data?.pages?.flatMap((page) => page.transactions) ?? [];

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleFilterChange = (type: TransactionFilterType) => {
    setFilterType(type);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Transaction History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <TransactionFilters
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          isLoading={isFetching}
        />

        {/* Loading State - Initial Load */}
        {isLoading && (
          <div className="space-y-4">
            <LoadingSkeleton variant="transactionList" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Failed to load transactions
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {error instanceof Error
                ? error.message
                : "There was an error loading your transaction history. Please try again."}
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && allTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm || filterType !== "all"
                ? "No transactions match your current filters. Try adjusting your search or filter criteria."
                : "This wallet doesn't have any transaction history yet."}
            </p>
            {(searchTerm || filterType !== "all") && (
              <Button
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Transaction List */}
        {!isLoading && !isError && allTransactions.length > 0 && (
          <div className="space-y-3">
            {allTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.hash}
                transaction={transaction}
                currentAddress={address}
                network={network}
              />
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load More Transactions"
                  )}
                </Button>
              </div>
            )}

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
              <div className="space-y-3">
                <LoadingSkeleton variant="transactionList" />
              </div>
            )}
          </div>
        )}

        {/* End of results indicator */}
        {!hasNextPage && allTransactions.length > 0 && !isLoading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              You've reached the end of your transaction history
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
