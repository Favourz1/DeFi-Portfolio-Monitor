/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_SUPPORTED_CHAINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Application configuration constants
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "DeFi Portfolio Tracker";

export const SUPPORTED_CHAINS = (
  import.meta.env.VITE_SUPPORTED_CHAINS || "1,11155111"
)
  .split(",")
  .map(Number);

export const CHAIN_CONFIG = {
  1: {
    name: "Ethereum Mainnet",
    shortName: "Mainnet",
    chainId: 1,
    networkId: "mainnet",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  11155111: {
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    chainId: 11155111,
    networkId: "sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

export const DEFAULT_CHAIN_ID = 1;

export const CACHE_TIMES = {
  TOKEN_BALANCES: 30000, // 30 seconds
  TRANSACTIONS: 60000, // 1 minute
  PORTFOLIO: 30000, // 30 seconds
} as const;
