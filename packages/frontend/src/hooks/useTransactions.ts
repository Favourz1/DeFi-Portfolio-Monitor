import { useInfiniteQuery } from "@tanstack/react-query";
import { walletApi } from "@/services/api/wallet.api";
import { Network } from "@/types/wallet.types";
import {
  TransactionsData,
  TransactionFilterType,
} from "@/types/transaction.types";

interface UseTransactionsParams {
  address: string | null;
  network: Network;
  type?: TransactionFilterType;
  search?: string;
  limit?: number;
}

/**
 * Hook to fetch transaction history with infinite scroll support
 *
 * @param params - Query parameters
 * @returns React Query infinite result with transactions data
 */
export function useTransactions({
  address,
  network,
  type = "all",
  search = "",
  limit = 20,
}: UseTransactionsParams) {
  return useInfiniteQuery<TransactionsData>({
    queryKey: ["transactions", address, network, type, search, limit],
    queryFn: ({ pageParam = 0 }) => {
      if (!address) {
        return Promise.reject(new Error("No address provided"));
      }

      return walletApi.getTransactions(address, {
        network,
        limit,
        offset: pageParam as number,
        type,
        search: search || undefined,
      });
    },
    enabled: !!address,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.hasMore
        ? pagination.offset + pagination.limit
        : undefined;
    },
    staleTime: 60000, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
