export type TransactionType = "eth_transfer" | "erc20_transfer";

export type TransactionStatus = "success" | "pending" | "failed";

export type TransactionFilterType = "all" | "sent" | "received";

/**
 * Single transaction
 */
export interface Transaction {
  hash: string;
  type: TransactionType;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
  timestamp: number;
  usdValue: string;
  status: TransactionStatus;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Transactions API response data
 */
export interface TransactionsData {
  address: string;
  network: "mainnet" | "sepolia";
  transactions: Transaction[];
  pagination: PaginationMeta;
}
