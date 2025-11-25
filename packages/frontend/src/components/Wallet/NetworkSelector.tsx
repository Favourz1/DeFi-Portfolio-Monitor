import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  Network,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { CHAIN_CONFIG, SUPPORTED_CHAINS } from "@/config/constants";
import { toast } from "sonner";

/**
 * Network selector component for switching between mainnet and sepolia
 *
 * @remarks
 * Uses shadcn Select component with network switching functionality
 * and loading states during network changes
 */
export function NetworkSelector() {
  const { chainId, switchNetwork, isConnected } = useWallet();
  const [isSwitching, setIsSwitching] = useState(false);

  /**
   * Handle network switching with error handling
   */
  const handleNetworkChange = async (newChainId: string) => {
    const targetChainId = parseInt(newChainId, 10);

    if (targetChainId === chainId) return;

    setIsSwitching(true);

    try {
      await switchNetwork(targetChainId);
      const networkName =
        CHAIN_CONFIG[targetChainId as keyof typeof CHAIN_CONFIG]?.shortName;
      toast.success(`Switched to ${networkName}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to switch network");
    } finally {
      setIsSwitching(false);
    }
  };

  // Don't show if wallet is not connected
  if (!isConnected) {
    return null;
  }

  // Show unsupported network warning
  if (chainId && !SUPPORTED_CHAINS.includes(chainId)) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Unsupported Network
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Please switch to Ethereum Mainnet or Sepolia Testnet
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNetworkChange("1")}
                disabled={isSwitching}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
              >
                {isSwitching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Mainnet"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNetworkChange("11155111")}
                disabled={isSwitching}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
              >
                {isSwitching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Sepolia"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Network className="h-4 w-4 text-muted-foreground" />
      <Select
        value={chainId?.toString() || ""}
        onValueChange={handleNetworkChange}
        disabled={isSwitching}
      >
        <SelectTrigger className="w-40 cursor-pointer">
          <SelectValue placeholder="Select network">
            {isSwitching ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Switching...</span>
              </div>
            ) : (
              chainId &&
              CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]?.shortName
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CHAINS.map((supportedChainId: number) => {
            const config =
              CHAIN_CONFIG[supportedChainId as keyof typeof CHAIN_CONFIG];
            if (!config) return null;

            return (
              <SelectItem
                key={supportedChainId}
                value={supportedChainId.toString()}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {supportedChainId === 1 ? (
                        <Zap className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="font-medium">{config.shortName}</span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Compact network selector for use in headers
 */
export function NetworkSelectorCompact() {
  const { chainId, switchNetwork, isConnected } = useWallet();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleNetworkChange = async (newChainId: string) => {
    const targetChainId = parseInt(newChainId, 10);

    if (targetChainId === chainId) return;

    setIsSwitching(true);

    try {
      await switchNetwork(targetChainId);
      const networkName =
        CHAIN_CONFIG[targetChainId as keyof typeof CHAIN_CONFIG]?.shortName;
      toast.success(`Switched to ${networkName}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to switch network");
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  // Show unsupported network as button
  if (chainId && !SUPPORTED_CHAINS.includes(chainId)) {
    return (
      <Badge variant="destructive" className="cursor-pointer">
        Unsupported Network
      </Badge>
    );
  }

  const currentConfig = chainId
    ? CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]
    : null;

  return (
    <Select
      value={chainId?.toString() || ""}
      onValueChange={handleNetworkChange}
      disabled={isSwitching}
    >
      <SelectTrigger className="w-32 h-8 cursor-pointer">
        <SelectValue>
          {isSwitching ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Switching</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {chainId === 1 ? (
                <Zap className="h-3 w-3 text-blue-500" />
              ) : (
                <Zap className="h-3 w-3 text-orange-500" />
              )}
              <span className="text-xs">{currentConfig?.shortName}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CHAINS.map((supportedChainId: number) => {
          const config =
            CHAIN_CONFIG[supportedChainId as keyof typeof CHAIN_CONFIG];
          if (!config) return null;

          return (
            <SelectItem
              key={supportedChainId}
              value={supportedChainId.toString()}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {supportedChainId === 1 ? (
                  <Zap className="h-3 w-3 text-blue-500" />
                ) : (
                  <Zap className="h-3 w-3 text-orange-500" />
                )}
                <span>{config.shortName}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/**
 * Network information display component
 */
export function NetworkInfo() {
  const { chainId, isConnected } = useWallet();

  if (!isConnected || !chainId) {
    return null;
  }

  const config = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG];

  if (!config) {
    return (
      <div className="text-sm text-muted-foreground">
        Unknown network (Chain ID: {chainId})
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Network:</span>
        {getNetworkBadge(chainId)}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Chain ID: {config.chainId}</div>
        <div>Currency: {config.nativeCurrency.symbol}</div>
        <div className="flex items-center gap-1">
          Explorer:
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs cursor-pointer"
            onClick={() =>
              window.open(config.blockExplorer, "_blank", "noopener,noreferrer")
            }
          >
            {config.blockExplorer.replace("https://", "")}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get network badge
 */
function getNetworkBadge(chainId: number) {
  if (chainId === 1) {
    return (
      <Badge
        variant="default"
        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      >
        Mainnet
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    >
      Testnet
    </Badge>
  );
}
