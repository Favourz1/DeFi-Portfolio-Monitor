import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wallet, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/utils/format";
import { toast } from "sonner";

/**
 * Wallet connection button with MetaMask integration
 *
 * @remarks
 * Handles wallet connection, shows connected address,
 * and provides disconnect functionality with MetaMask detection
 */
export function WalletConnection() {
  const {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    isMetaMaskInstalled,
    isConnected,
  } = useWallet();

  const [copied, setCopied] = React.useState(false);
  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info("Wallet disconnected");
  };

  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  /**
   * Open address in block explorer
   */
  const handleViewOnExplorer = () => {
    if (!address) return;

    const explorerUrl = `https://etherscan.io/address/${address}`;
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  // Show MetaMask installation prompt if not installed
  if (!isMetaMaskInstalled) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                MetaMask Required
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Install MetaMask to connect your wallet
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900 cursor-pointer"
            >
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 cursor-pointer"
              >
                Install
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show connected state
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {formatAddress(address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 cursor-pointer"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewOnExplorer}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 cursor-pointer"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Connected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center gap-3">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Error
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 truncate">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          size="sm"
          className="cursor-pointer"
        >
          {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Retry
        </Button>
      </div>
    );
  }

  // Show connect button
  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 cursor-pointer"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}

/**
 * Compact wallet connection component for use in headers
 */
export function WalletConnectionCompact() {
  const {
    address,
    isConnecting,
    connect,
    disconnect,
    isMetaMaskInstalled,
    isConnected,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected");
    } catch (err: any) {
      toast.error(err.message || "Connection failed");
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Button variant="outline" size="sm" asChild className="cursor-pointer">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          Install MetaMask
        </a>
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 bg-secondary rounded-md text-sm font-medium">
          {formatAddress(address)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      size="sm"
      className="cursor-pointer"
    >
      {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Wallet className="mr-2 h-4 w-4" />
      Connect
    </Button>
  );
}
