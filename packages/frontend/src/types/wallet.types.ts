/**
 * Supported network types
 */
export type Network = "mainnet" | "sepolia";

/**
 * Wallet connection state
 */
export interface WalletState {
  /** Connected wallet address (null if not connected) */
  address: string | null;
  /** Current chain ID */
  chainId: number | null;
  network: Network;
  isConnecting: boolean;
  error: string | null;
  isMetaMaskInstalled: boolean;
  /** Whether in manual address input mode */
  isManualMode: boolean;
}

/**
 * Chain information
 */
export interface ChainInfo {
  name: string;
  shortName: string;
  chainId: number;
  networkId: Network;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
