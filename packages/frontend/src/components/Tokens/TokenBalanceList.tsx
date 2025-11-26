import { useMemo } from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { Network } from "@/types/wallet.types";
import { TokenBalance } from "@/types/token.types";
import { TokenBalanceItem } from "./TokenBalanceItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, AlertCircle } from "lucide-react";

interface TokenBalanceListProps {
  address: string;
  network: Network;
}

/**
 * Token balance list component
 *
 * @remarks
 * Displays list of token balances with logos, symbols, amounts, USD values
 * Includes ETH balance at top, sorted by USD value (descending)
 * Shows skeleton loaders during loading and empty state when no tokens
 */
export function TokenBalanceList({ address, network }: TokenBalanceListProps) {
  const { data, isLoading, error, refetch } = useTokenBalances(
    address,
    network
  );

  // Sort tokens by USD value (descending) and create ETH token for display
  const sortedTokensWithEth = useMemo(() => {
    if (!data) return [];

    const tokens = [...data.tokens];

    // Sort tokens by USD value (descending)
    tokens.sort((a, b) => parseFloat(b.usdValue) - parseFloat(a.usdValue));

    // Create ETH token object for consistent display
    const ethToken: TokenBalance = {
      contractAddress: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      balance: data.ethBalance.balance,
      decimals: 18,
      usdValue: data.ethBalance.usdValue,
      logo: undefined, // Will use fallback
    };

    // Return ETH first, then sorted tokens
    return [ethToken, ...tokens];
  }, [data]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Balances
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {error.message ||
                "Unable to fetch token balances. Please try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || sortedTokensWithEth.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
            <p className="text-muted-foreground max-w-md">
              This wallet doesn't have any token balances on{" "}
              {network === "mainnet" ? "Ethereum Mainnet" : "Sepolia Testnet"}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedTokensWithEth.length} token
            {sortedTokensWithEth.length !== 1 ? "s" : ""}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sortedTokensWithEth.map((token, index) => (
          <TokenBalanceItem
            key={token.contractAddress}
            token={token}
            className={
              index === 0 ? "border-primary/20 bg-primary/5" : undefined
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}
