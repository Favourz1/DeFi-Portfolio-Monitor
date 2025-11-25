import { useEffect } from "react";
import { useWalletStore } from "@/store/wallet.store";
import { WalletService } from "@/services/web3/wallet.service";
import { CHAIN_CONFIG } from "@/config/constants";
import { normalizeEthereumAddress } from "@/utils/validation";

/**
 * Custom hook for wallet management
 *
 * @returns Wallet state and actions
 */
export function useWallet() {
  const store = useWalletStore();

  // Check MetaMask installation on mount
  useEffect(() => {
    const isInstalled = WalletService.isMetaMaskInstalled();
    store.setMetaMaskInstalled(isInstalled);

    if (!isInstalled) return;

    // Check if already connected
    WalletService.getCurrentAccount().then((account) => {
      if (account) {
        WalletService.getChainId().then((chainId) => {
          store.setAddress(account);
          store.setChainId(chainId);

          const network = chainId === 1 ? "mainnet" : "sepolia";
          store.setNetwork(network);
        });
      }
    });

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        store.disconnect();
      } else {
        store.setAddress(accounts[0]);
      }
    };

    // Listen for network changes
    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      store.setChainId(chainId);

      const network =
        CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]?.networkId ||
        "mainnet";
      store.setNetwork(network);

      // Reload to clear stale data
      window.location.reload();
    };

    WalletService.onAccountsChanged(handleAccountsChanged);
    WalletService.onChainChanged(handleChainChanged);

    return () => {
      WalletService.removeAccountsChangedListener(handleAccountsChanged);
      WalletService.removeChainChangedListener(handleChainChanged);
    };
  }, []);

  const connect = async () => {
    store.setConnecting(true);
    store.setError(null);

    try {
      const { address, chainId } = await WalletService.connect();
      store.setAddress(address);
      store.setChainId(chainId);

      const network = chainId === 1 ? "mainnet" : "sepolia";
      store.setNetwork(network);
    } catch (error: any) {
      store.setError(error.message);
      throw error;
    } finally {
      store.setConnecting(false);
    }
  };

  const switchNetwork = async (chainId: number) => {
    try {
      await WalletService.switchNetwork(chainId);
      // The chain change event will handle updating the store
    } catch (error: any) {
      store.setError(error.message);
      throw error;
    }
  };

  const setManualAddress = (address: string) => {
    const normalizedAddress = normalizeEthereumAddress(address);
    if (normalizedAddress) {
      store.setAddress(normalizedAddress);
      store.setManualMode(true);
      store.setError(null);
      // Set default chain ID for manual mode
      store.setChainId(store.network === "mainnet" ? 1 : 11155111);
    } else {
      throw new Error("Invalid Ethereum address format");
    }
  };

  const clearManualAddress = () => {
    store.setAddress(null);
    store.setManualMode(false);
    store.setChainId(null);
    store.setError(null);
  };

  return {
    address: store.address,
    chainId: store.chainId,
    network: store.network,
    isConnecting: store.isConnecting,
    error: store.error,
    isMetaMaskInstalled: store.isMetaMaskInstalled,
    isManualMode: store.isManualMode,
    isConnected: store.address !== null,
    connect,
    disconnect: store.disconnect,
    switchNetwork,
    setManualAddress,
    clearManualAddress,
  };
}
