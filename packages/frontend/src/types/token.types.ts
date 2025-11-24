/**
 * Token balance with metadata
 */
export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  usdValue: string;
  logo?: string;
}

/**
 * ETH balance
 */
export interface EthBalance {
  balance: string;
  usdValue: string;
}

/**
 * Token balances API response data
 */
export interface TokenBalancesData {
  address: string;
  network: "mainnet" | "sepolia";
  tokens: TokenBalance[];
  ethBalance: EthBalance;
  totalValue: string;
  lastUpdated: string;
}
