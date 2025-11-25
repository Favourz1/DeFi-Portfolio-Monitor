import { create } from "zustand";
import { WalletState, Network } from "@/types/wallet.types";

/**
 * Wallet store actions
 */
interface WalletActions {
  /** Connect MetaMask wallet */
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setNetwork: (network: Network) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  setMetaMaskInstalled: (isInstalled: boolean) => void;
  /** Set manual address input mode */
  setManualMode: (isManual: boolean) => void;
  disconnect: () => void;
  /** Reset store to initial state */
  reset: () => void;
}

type WalletStore = WalletState & WalletActions;

const initialState: WalletState = {
  address: null,
  chainId: null,
  network: "mainnet",
  isConnecting: false,
  error: null,
  isMetaMaskInstalled: false,
  isManualMode: false,
};

/**
 * Zustand store for wallet state management
 *
 * @remarks
 * Manages wallet connection state, account info, and network
 */
export const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,

  setAddress: (address) => set({ address, error: null }),

  setChainId: (chainId) => set({ chainId }),

  setNetwork: (network) => set({ network }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error: string | null) => set({ error, isConnecting: false }),

  setMetaMaskInstalled: (isMetaMaskInstalled: boolean) =>
    set({ isMetaMaskInstalled }),

  setManualMode: (isManualMode: boolean) => set({ isManualMode }),

  disconnect: () => set({ ...initialState, isMetaMaskInstalled: true }),

  reset: () => set(initialState),
}));

/**
 * Selectors for derived state
 */
export const walletSelectors = {
  isConnected: (state: WalletStore) => state.address !== null,
  hasError: (state: WalletStore) => state.error !== null,
  canConnect: (state: WalletStore) =>
    state.isMetaMaskInstalled && !state.isConnecting && state.address === null,
};
