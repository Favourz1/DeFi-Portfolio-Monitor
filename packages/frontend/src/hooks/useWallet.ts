import { useAccount, useChainId, useSwitchChain, useDisconnect } from "wagmi";
import { mainnet } from "wagmi/chains";
import { useWalletStore } from "@/store/wallet.store";
import { Network } from "@/types/wallet.types";
import { normalizeEthereumAddress } from "@/utils/validation";

/**
 * Custom hook for wallet management with Wagmi
 *
 * @remarks
 * Wraps Wagmi hooks and provides a consistent interface for the app.
 * Combines Wagmi wallet state with manual address mode for viewing portfolios
 * without connecting a wallet.
 *
 * @returns Wallet state and actions
 */
export function useWallet() {
  // Wagmi hooks for wallet connection state
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Manual address mode (for viewing portfolios without connecting wallet)
  const {
    address: manualAddress,
    isManualMode,
    setManualAddress: setManualAddressStore,
    clearManualAddress: clearManual,
    network: manualNetwork,
    setNetwork: setNetworkStore,
  } = useWalletStore();

  /**
   * Get the current effective address (Wagmi wallet address or manual address)
   */
  const address = wagmiIsConnected ? wagmiAddress : manualAddress;

  /**
   * Check if connected (either via wallet or manual mode)
   */
  const isConnected = wagmiIsConnected || isManualMode;

  /**
   * Map chainId to network
   * When in manual mode, use the manual network; otherwise use Wagmi chainId
   */
  const network: Network =
    isManualMode && !wagmiIsConnected
      ? manualNetwork
      : chainId === mainnet.id
        ? "mainnet"
        : "sepolia";

  /**
   * Switch network handler
   */
  const switchNetwork = async (targetChainId: number) => {
    if (!wagmiIsConnected) {
      throw new Error("Wallet not connected");
    }

    try {
      await switchChain({ chainId: targetChainId });
    } catch (error: unknown) {
      // Handle user rejection
      const errorCode =
        error && typeof error === "object" && "code" in error
          ? (error as { code?: number }).code
          : undefined;

      if (errorCode === 4001) {
        throw new Error("Network switch rejected");
      }
      throw error;
    }
  };

  /**
   * Disconnect wallet handler
   */
  const disconnect = () => {
    if (wagmiIsConnected) {
      wagmiDisconnect();
    }
    if (isManualMode) {
      clearManual();
    }
  };

  /**
   * Set manual address with validation
   */
  const setManualAddress = (address: string) => {
    const normalizedAddress = normalizeEthereumAddress(address);
    if (normalizedAddress) {
      setManualAddressStore(normalizedAddress);
      // Set network based on current chainId if wallet is connected, otherwise keep manual network
      if (!wagmiIsConnected) {
        // In manual mode, default to mainnet if not set
        if (!manualNetwork) {
          setNetworkStore("mainnet");
        }
      }
    } else {
      throw new Error("Invalid Ethereum address format");
    }
  };

  /**
   * Clear manual address
   */
  const clearManualAddress = () => {
    clearManual();
  };

  return {
    // Address state
    address: address as string | null,
    chainId: wagmiIsConnected ? chainId : null,
    network,
    isConnected,
    isManualMode,

    // Wagmi-specific states
    isWalletConnected: wagmiIsConnected,
    isSwitchingChain,

    // Actions
    switchNetwork,
    disconnect,
    setManualAddress,
    clearManualAddress,

    // Legacy compatibility (for components that check these)
    isConnecting: false, // RainbowKit handles this internally
    error: null, // RainbowKit handles errors internally
    isMetaMaskInstalled: true, // Not needed with RainbowKit
  };
}
