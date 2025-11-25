import { TokenBalance } from "@/types/token.types";
import { formatTokenBalance, formatUSD } from "@/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TokenBalanceItemProps {
  token: TokenBalance;
  className?: string;
}

/**
 * Individual token balance item component
 *
 * @remarks
 * Displays token logo, symbol, name, balance, and USD value
 * Responsive design: row on desktop, card on mobile
 */
export function TokenBalanceItem({ token, className }: TokenBalanceItemProps) {
  const { symbol, name, balance, usdValue, logo, contractAddress } = token;

  return (
    <Card className={cn("transition-colors hover:bg-muted/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Token Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Token Logo */}
            <div className="shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt={`${symbol} logo`}
                  className="w-10 h-10 rounded-full bg-muted"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              {/* Fallback placeholder */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground",
                  logo && "hidden"
                )}
              >
                {symbol.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Token Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{symbol}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {name.length > 20 ? `${name.slice(0, 20)}...` : name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {contractAddress}
              </p>
            </div>
          </div>

          {/* Balance and Value */}
          <div className="text-right shrink-0">
            <div className="font-semibold text-sm">
              {formatTokenBalance(balance)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatUSD(usdValue)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
