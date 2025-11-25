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
 */
export function TransactionItem({
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

  // Determine if this is an incoming or outgoing transaction
  const isIncoming = to.toLowerCase() === currentAddress.toLowerCase();
  const isOutgoing = from.toLowerCase() === currentAddress.toLowerCase();

  // Get transaction type icon and color
  const getTransactionIcon = () => {
    if (type === "eth_transfer") {
      return isIncoming ? (
        <ArrowDownLeft className="h-4 w-4 text-green-500" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-red-500" />
      );
    } else {
      return <Coins className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: TransactionStatus) => {
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
  };

  // Get block explorer URL
  const getBlockExplorerUrl = () => {
    const chainConfig = CHAIN_CONFIG[network === "mainnet" ? 1 : 11155111];
    return `${chainConfig.blockExplorer}/tx/${hash}`;
  };

  // Format the transaction amount
  const formatAmount = () => {
    if (type === "eth_transfer") {
      return `${formatTokenBalance(value)} ETH`;
    } else {
      return `${formatTokenBalance(value)} ${tokenSymbol || "TOKEN"}`;
    }
  };

  // Get transaction direction text
  const getDirectionText = () => {
    if (isIncoming) return "Received";
    if (isOutgoing) return "Sent";
    return "Transfer";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Icon, type, and addresses */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Transaction icon */}
            <div className="shrink-0 mt-1">{getTransactionIcon()}</div>

            {/* Transaction details */}
            <div className="flex-1 min-w-0">
              {/* Transaction type and token info */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {getDirectionText()}
                </span>
                {tokenName && (
                  <span className="text-xs text-muted-foreground">
                    {tokenName}
                  </span>
                )}
                <Badge variant={getStatusVariant(status)} className="text-xs">
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
                <div className="font-medium text-sm">{formatAmount()}</div>
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
              {formatAmount()}
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
            <Button variant="ghost" size="sm" className="h-6 px-2 mt-1" asChild>
              <a
                href={getBlockExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">View</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile: Block explorer link */}
        <div className="mt-3 sm:hidden">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={getBlockExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
