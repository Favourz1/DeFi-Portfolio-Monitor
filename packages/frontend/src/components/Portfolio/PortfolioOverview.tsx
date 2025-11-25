import { usePortfolio } from "@/hooks/usePortfolio";
import { Network } from "@/types/wallet.types";
import { formatUSD, formatRelativeTime } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  RefreshCw,
  Wallet,
  AlertCircle,
  DollarSign,
  Coins,
} from "lucide-react";
import { useMemo } from "react";

interface PortfolioOverviewProps {
  address: string;
  network: Network;
}

/**
 * Portfolio overview component
 *
 * @remarks
 * Displays total portfolio value prominently with ETH balance and token value breakdown
 * Includes refresh button with loading state and skeleton loader during initial load
 */
export function PortfolioOverview({
  address,
  network,
}: PortfolioOverviewProps) {
  const { data, isLoading, error, refetch, isFetching } = usePortfolio(
    address,
    network
  );

  // Calculate breakdown values
  const breakdown = useMemo(() => {
    if (!data) return null;

    const ethValue = parseFloat(data.ethBalance.usdValue);
    const tokensValue = data.tokens.reduce(
      (sum, token) => sum + parseFloat(token.usdValue),
      0
    );
    const totalValue = parseFloat(data.totalValue);

    return {
      ethValue,
      tokensValue,
      totalValue,
      ethPercentage: totalValue > 0 ? (ethValue / totalValue) * 100 : 0,
      tokensPercentage: totalValue > 0 ? (tokensValue / totalValue) * 100 : 0,
    };
  }, [data]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Value Skeleton */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>

          {/* Breakdown Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
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
            <TrendingUp className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Portfolio
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {error.message ||
                "Unable to fetch portfolio data. Please try again."}
            </p>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              variant="outline"
            >
              {isFetching && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data || !breakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio Data</h3>
            <p className="text-muted-foreground">
              Unable to load portfolio information for this wallet.
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
            <TrendingUp className="h-5 w-5" />
            Portfolio Overview
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className={`h-4 w-4 ${isFetching ? "hidden" : ""}`} />
            {!isFetching && (
              <span className="ml-2 hidden sm:inline">Refresh</span>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Portfolio Value */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            {formatUSD(breakdown.totalValue)}
          </h2>
          <p className="text-xs text-muted-foreground">
            Last updated{" "}
            {formatRelativeTime(
              Math.floor(new Date(data.lastUpdated).getTime() / 1000)
            )}
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ETH Balance */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ETH Balance</p>
                    <p className="text-xs text-muted-foreground">
                      {breakdown.ethPercentage.toFixed(1)}% of portfolio
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatUSD(breakdown.ethValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(data.ethBalance.balance).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Balance */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tokens</p>
                    <p className="text-xs text-muted-foreground">
                      {breakdown.tokensPercentage.toFixed(1)}% of portfolio
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatUSD(breakdown.tokensValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.tokens.length} token
                    {data.tokens.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                network === "mainnet" ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {network === "mainnet" ? "Ethereum Mainnet" : "Sepolia Testnet"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
