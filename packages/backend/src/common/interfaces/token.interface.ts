/**
 * Token balance information with USD valuation
 */
export interface TokenBalance {
  /** ERC-20 token contract address */
  contractAddress: string;
  /** Token symbol (e.g., USDC, DAI) */
  symbol: string;
  name: string;
  /** Raw balance as string (to handle large numbers) */
  balance: string;
  decimals: number;
  usdValue: string;
  /** Token logo URL (optional) */
  logo?: string;
}

/**
 * Response format for token balances endpoint
 */
export interface TokenBalancesResponse {
  /** Wallet address */
  address: string;
  network: "mainnet" | "sepolia";
  tokens: TokenBalance[];
  /** Native ETH balance */
  ethBalance: {
    balance: string;
    usdValue: string;
  };
  /** Total portfolio value in USD */
  totalValue: string;
  lastUpdated: string;
}
