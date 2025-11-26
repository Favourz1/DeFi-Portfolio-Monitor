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
  Network as NetworkIcon,
  Zap,
} from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { SUPPORTED_CHAINS } from "@/config/constants";
import { toast } from "sonner";

/**
 * Network selector component using Wagmi
 *
 * @remarks
 * Uses Wagmi's useSwitchChain hook for network switching.
 * Automatically handles loading states and errors.
 */
export function NetworkSelector() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  /**
   * Handle network switching
   */
  const handleNetworkChange = async (newChainIdStr: string) => {
    const targetChainId = parseInt(newChainIdStr, 10);

    if (targetChainId === chainId) return;

    try {
      await switchChain({ chainId: targetChainId });
      const networkName = targetChainId === mainnet.id ? "Mainnet" : "Sepolia";
      toast.success(`Switched to ${networkName}`);
    } catch (error: any) {
      // User rejected the switch
      if (error.code === 4001 || error.message?.includes("User rejected")) {
        toast.error("Network switch rejected");
      } else {
        toast.error(error.message || "Failed to switch network");
      }
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
                onClick={() => handleNetworkChange(mainnet.id.toString())}
                disabled={isPending}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Mainnet"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNetworkChange(sepolia.id.toString())}
                disabled={isPending}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
              >
                {isPending ? (
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
    <div className="hidden! items-center gap-2">
      <NetworkIcon className="h-4 w-4 text-muted-foreground" />
      <Select
        value={chainId?.toString() || ""}
        onValueChange={handleNetworkChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-40 cursor-pointer">
          <SelectValue placeholder="Select network">
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Switching...</span>
              </div>
            ) : chainId === mainnet.id ? (
              "Mainnet"
            ) : (
              "Sepolia"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={mainnet.id.toString()} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Mainnet</span>
            </div>
          </SelectItem>
          <SelectItem value={sepolia.id.toString()} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Sepolia</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Compact network selector for headers
 */
export function NetworkSelectorCompact() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const handleNetworkChange = async (newChainIdStr: string) => {
    const targetChainId = parseInt(newChainIdStr, 10);
    if (targetChainId === chainId) return;

    try {
      await switchChain({ chainId: targetChainId });
    } catch (error: any) {
      toast.error(error.message || "Failed to switch network");
    }
  };

  if (!isConnected) {
    return null;
  }

  if (chainId && !SUPPORTED_CHAINS.includes(chainId)) {
    return (
      <Badge variant="destructive" className="cursor-pointer">
        Unsupported Network
      </Badge>
    );
  }

  return (
    <Select
      value={chainId?.toString() || ""}
      onValueChange={handleNetworkChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-32 h-8 cursor-pointer">
        <SelectValue>
          {isPending ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Switching</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {chainId === mainnet.id ? (
                <Zap className="h-3 w-3 text-blue-500" />
              ) : (
                <Zap className="h-3 w-3 text-orange-500" />
              )}
              <span className="text-xs">
                {chainId === mainnet.id ? "Mainnet" : "Sepolia"}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={mainnet.id.toString()} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-blue-500" />
            <span>Mainnet</span>
          </div>
        </SelectItem>
        <SelectItem value={sepolia.id.toString()} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-orange-500" />
            <span>Sepolia</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

/**
 * Network information display
 */
export function NetworkInfo() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  if (!isConnected || !chainId) {
    return null;
  }

  const isMainnet = chainId === mainnet.id;
  const explorerUrl = isMainnet
    ? "https://etherscan.io"
    : "https://sepolia.etherscan.io";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Network:</span>
        {isMainnet ? (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Mainnet
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          >
            Testnet
          </Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Chain ID: {chainId}</div>
        <div>Currency: ETH</div>
        <div className="flex items-center gap-1">
          Explorer:
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {explorerUrl.replace("https://", "")}
          </a>
        </div>
      </div>
    </div>
  );
}
