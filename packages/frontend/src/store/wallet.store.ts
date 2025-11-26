import { create } from "zustand";
import { Network } from "@/types/wallet.types";

/**
 * Simplified wallet store for manual address mode
 *
 * @remarks
 * With RainbowKit/Wagmi, most wallet state is managed by those libraries.
 * This store now only handles the "manual address input" feature for viewing
 * portfolios without connecting a wallet.
 */

interface ManualAddressState {
  address: string | null;
  isManualMode: boolean;
  network: Network;
}

interface ManualAddressActions {
  setManualAddress: (address: string) => void;
  clearManualAddress: () => void;
  setNetwork: (network: Network) => void;
}

type WalletStore = ManualAddressState & ManualAddressActions;

const initialState: ManualAddressState = {
  address: null,
  isManualMode: false,
  network: "mainnet",
};

/**
 * Zustand store for manual address feature
 *
 * @remarks
 * Only manages manual address input state. Wallet connection state
 * is now handled by Wagmi/RainbowKit hooks.
 */
export const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,

  setManualAddress: (address: string) =>
    set({
      address,
      isManualMode: true,
    }),

  clearManualAddress: () =>
    set({
      address: null,
      isManualMode: false,
    }),

  setNetwork: (network: Network) =>
    set({
      network,
    }),
}));
