/**
 * Supported network types
 */
export type Network = "mainnet" | "sepolia";

/**
 * Wallet connection state
 *
 * @remarks
 * With RainbowKit/Wagmi, most of this state is managed by those libraries.
 * This interface is kept for backward compatibility with existing components.
 */
export interface WalletState {
  address: string | null;
  chainId: number | null;
  network: Network;
  isConnecting: boolean;
  error: string | null;
  isMetaMaskInstalled: boolean;
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
