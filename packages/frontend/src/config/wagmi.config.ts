import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

/**
 * Wagmi configuration for wallet connections
 *
 * @remarks
 * Configures supported chains (Mainnet, Sepolia) and wallet connectors
 * Uses HTTP transports with public RPC endpoints (can be upgraded to Alchemy)
 */

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

/**
 * Wagmi config instance
 */
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({
      target: "metaMask",
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: "DeFi Portfolio Tracker",
        description: "Track your DeFi portfolio across networks",
        url: "https://defi-portfolio.com",
        icons: ["https://defi-portfolio.com/icon.png"],
      },
    }),
    coinbaseWallet({
      appName: "DeFi Portfolio Tracker",
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false, // Disable server-side rendering
});

/**
 * Re-export chains for convenience
 */
export { mainnet, sepolia };
