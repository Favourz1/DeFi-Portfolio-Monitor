import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Wallet connection component using RainbowKit
 *
 * @remarks
 * Uses RainbowKit's default ConnectButton which handles:
 * - Connection flow with wallet selection
 * - Disconnect functionality
 * - Network switching
 * - Address display
 * - Loading states
 * - Error handling
 */
export function WalletConnection() {
  return <ConnectButton />;
}

/**
 * Compact wallet connection for headers
 */
export function WalletConnectionCompact() {
  return <ConnectButton showBalance={false} chainStatus="icon" />;
}
