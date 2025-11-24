/**
 * Transaction type enum
 */
export enum TransactionType {
  ETH_TRANSFER = "eth_transfer",
  ERC20_TRANSFER = "erc20_transfer",
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}

/**
 * Single transaction details
 */
export interface Transaction {
  hash: string;
  type: TransactionType;
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string;
  /** Transaction value (in wei for ETH, in token units for ERC-20) */
  value: string;
  /** Token symbol (for ERC-20 transfers) */
  tokenSymbol?: string;
  /** Token name (for ERC-20 transfers) */
  tokenName?: string;
  /** Token contract address (for ERC-20 transfers) */
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
 * Response format for transactions endpoint
 */
export interface TransactionsResponse {
  /** Wallet address */
  address: string;
  network: "mainnet" | "sepolia";
  transactions: Transaction[];
  pagination: PaginationMeta;
}
