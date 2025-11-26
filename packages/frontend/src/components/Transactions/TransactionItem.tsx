import { memo, useMemo } from "react";
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction, TransactionStatus } from "@/types/transaction.types";
import {
  formatAddress,
  formatTokenBalance,
  formatUSD,
  formatRelativeTime,
} from "@/utils/format";
import { CHAIN_CONFIG } from "@/config/constants";
import { Network } from "@/types/wallet.types";

interface TransactionItemProps {
  transaction: Transaction;
  currentAddress: string;
  network: Network;
}

/**
 * Individual transaction item component
 *
 * @remarks
 * Displays transaction details including type, addresses, amount, timestamp, and status.
 * Provides link to block explorer and responsive design for mobile/desktop.
 * Memoized to prevent unnecessary re-renders when parent updates
 */
export const TransactionItem = memo(function TransactionItem({
  transaction,
  currentAddress,
  network,
}: TransactionItemProps) {
  const {
    hash,
    type,
    from,
    to,
    value,
    tokenSymbol,
    tokenName,
    timestamp,
    usdValue,
    status,
  } = transaction;

  // Memoize computed values to prevent recalculation on re-renders
  const isIncoming = useMemo(
    () => to.toLowerCase() === currentAddress.toLowerCase(),
    [to, currentAddress]
  );
  const isOutgoing = useMemo(
    () => from.toLowerCase() === currentAddress.toLowerCase(),
    [from, currentAddress]
  );

  const transactionIcon = useMemo(() => {
    if (type === "eth_transfer") {
      return isIncoming ? (
        <ArrowDownLeft className="h-4 w-4 text-green-500" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-red-500" />
      );
    } else {
      return <Coins className="h-4 w-4 text-blue-500" />;
    }
  }, [type, isIncoming]);

  const statusVariant = useMemo(() => {
    switch (status) {
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  }, [status]);

  const blockExplorerUrl = useMemo(() => {
    const chainConfig = CHAIN_CONFIG[network === "mainnet" ? 1 : 11155111];
    return `${chainConfig.blockExplorer}/tx/${hash}`;
  }, [network, hash]);

  const formattedAmount = useMemo(() => {
    if (type === "eth_transfer") {
      return `${formatTokenBalance(value)} ETH`;
    } else {
      return `${formatTokenBalance(value)} ${tokenSymbol || "TOKEN"}`;
    }
  }, [type, value, tokenSymbol]);

  const directionText = useMemo(() => {
    if (isIncoming) return "Received";
    if (isOutgoing) return "Sent";
    return "Transfer";
  }, [isIncoming, isOutgoing]);

  return (
    <Card className="hover:shadow-md transition-all duration-200 ease-in-out hover-lift focus-ring">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Icon, type, and addresses */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Transaction icon */}
            <div className="shrink-0 mt-1">{transactionIcon}</div>

            {/* Transaction details */}
            <div className="flex-1 min-w-0">
              {/* Transaction type and token info */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{directionText}</span>
                {tokenName && (
                  <span className="text-xs text-muted-foreground">
                    {tokenName}
                  </span>
                )}
                <Badge variant={statusVariant} className="text-xs">
                  {status}
                </Badge>
              </div>

              {/* Addresses */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <span>From:</span>
                  <span className="font-mono">{formatAddress(from)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>To:</span>
                  <span className="font-mono">{formatAddress(to)}</span>
                </div>
              </div>

              {/* Mobile: Amount and timestamp */}
              <div className="mt-2 sm:hidden">
                <div className="font-medium text-sm">{formattedAmount}</div>
                {parseFloat(usdValue) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {formatUSD(usdValue)}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(timestamp)}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Amount, USD value, timestamp, and actions (desktop) */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            {/* Amount */}
            <div className="font-medium text-sm text-right">
              {formattedAmount}
            </div>

            {/* USD value */}
            {parseFloat(usdValue) > 0 && (
              <div className="text-xs text-muted-foreground">
                {formatUSD(usdValue)}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground">
              {formatRelativeTime(timestamp)}
            </div>

            {/* Block explorer link */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 mt-1 cursor-pointer"
              asChild
            >
              <a
                href={blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">View</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile: Block explorer link */}
        <div className="mt-3 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full cursor-pointer"
            asChild
          >
            <a
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
