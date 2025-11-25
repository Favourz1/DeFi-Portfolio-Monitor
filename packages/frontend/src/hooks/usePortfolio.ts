import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/services/api/wallet.api";
import { Network } from "@/types/wallet.types";
import { TokenBalancesData } from "@/types/token.types";

/**
 * Hook to fetch portfolio data for a wallet
 *
 * @param address - Wallet address (null if not connected)
 * @param network - Network to fetch data from
 * @returns React Query result with portfolio data
 */
export function usePortfolio(address: string | null, network: Network) {
  return useQuery<TokenBalancesData>({
    queryKey: ["portfolio", address, network],
    queryFn: () =>
      address
        ? walletApi.getPortfolio(address, network)
        : Promise.reject(new Error("No address provided")),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
