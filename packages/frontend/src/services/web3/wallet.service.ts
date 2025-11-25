import { CHAIN_CONFIG, SUPPORTED_CHAINS } from "@/config/constants";

/**
 * MetaMask provider type
 */
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Wallet service for MetaMask integration
 */
export class WalletService {
  static isMetaMaskInstalled(): boolean {
    return (
      typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask)
    );
  }

  /**
   * Connect to MetaMask wallet
   *
   * @returns Connected wallet address
   * @throws Error if connection fails
   */
  static async connect(): Promise<{ address: string; chainId: number }> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask extension."
      );
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }

      // Get current chain ID
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = parseInt(chainIdHex, 16);

      // Validate network
      if (!SUPPORTED_CHAINS.includes(chainId)) {
        throw new Error(
          `Unsupported network. Please switch to Ethereum Mainnet or Sepolia Testnet.`
        );
      }

      return {
        address: accounts[0],
        chainId,
      };
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error(
          "Connection rejected. Please approve the connection request."
        );
      }
      throw error;
    }
  }

  /**
   * Switch to a different network
   *
   * @param chainId - Target chain ID
   * @throws Error if switch fails
   */
  static async switchNetwork(chainId: number): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    if (!SUPPORTED_CHAINS.includes(chainId)) {
      throw new Error("Unsupported network");
    }

    const chainIdHex = `0x${chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        const chainConfig = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG];

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chainConfig.name,
              nativeCurrency: chainConfig.nativeCurrency,
              rpcUrls: [chainConfig.rpcUrl],
              blockExplorerUrls: [chainConfig.blockExplorer],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current account
   *
   * @returns Current account address or null
   */
  static async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts[0] || null;
    } catch (error) {
      console.error("Failed to get current account:", error);
      return null;
    }
  }

  /**
   * Get current chain ID
   *
   * @returns Current chain ID
   */
  static async getChainId(): Promise<number> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed");
    }

    const chainIdHex = await window.ethereum.request({
      method: "eth_chainId",
    });
    return parseInt(chainIdHex, 16);
  }

  /**
   * Listen for account changes
   *
   * @param callback - Callback function with new accounts
   */
  static onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.on("accountsChanged", callback);
  }

  /**
   * Listen for network changes
   *
   * @param callback - Callback function with new chain ID
   */
  static onChainChanged(callback: (chainId: string) => void): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.on("chainChanged", callback);
  }

  /**
   * Remove account change listener
   *
   * @param callback - Callback to remove
   */
  static removeAccountsChangedListener(
    callback: (accounts: string[]) => void
  ): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.removeListener("accountsChanged", callback);
  }

  /**
   * Remove chain change listener
   *
   * @param callback - Callback to remove
   */
  static removeChainChangedListener(callback: (chainId: string) => void): void {
    if (!this.isMetaMaskInstalled()) {
      return;
    }

    window.ethereum.removeListener("chainChanged", callback);
  }
}
