import { apiClient, unwrapApiResponse } from "@/services/api/client";
import { TokenBalancesData } from "@/types/token.types";
import { TransactionsData } from "@/types/transaction.types";
import { Network } from "@/types/wallet.types";

/**
 * Wallet API service methods
 */
export const walletApi = {
  /**
   * Get token balances for a wallet
   *
   * @param address - Wallet address
   * @param network - Network (mainnet or sepolia)
   * @returns Token balances data
   */
  getTokenBalances: async (
    address: string,
    network: Network
  ): Promise<TokenBalancesData> => {
    return unwrapApiResponse(
      apiClient.get(`/wallet/${address}/tokens`, {
        params: { network },
      })
    );
  },

  /**
   * Get transaction history for a wallet
   *
   * @param address - Wallet address
   * @param params - Query parameters
   * @returns Transactions data
   */
  getTransactions: async (
    address: string,
    params: {
      network: Network;
      limit?: number;
      offset?: number;
      type?: "all" | "sent" | "received";
      search?: string;
    }
  ): Promise<TransactionsData> => {
    return unwrapApiResponse(
      apiClient.get(`/wallet/${address}/transactions`, {
        params,
      })
    );
  },

  /**
   * Get portfolio data for a wallet
   *
   * @param address - Wallet address
   * @param network - Network
   * @returns Portfolio data (same as token balances)
   */
  getPortfolio: async (
    address: string,
    network: Network
  ): Promise<TokenBalancesData> => {
    return unwrapApiResponse(
      apiClient.get(`/wallet/${address}/portfolio`, {
        params: { network },
      })
    );
  },
};
