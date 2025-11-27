/**
 * Alchemy provider interfaces
 */

/**
 * Raw token balance from Alchemy API
 */
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

/**
 * Token metadata from Alchemy API
 */
export interface AlchemyTokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}
