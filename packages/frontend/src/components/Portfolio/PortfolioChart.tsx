import { useMemo } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Network } from "@/types/wallet.types";
import { formatUSD, formatPercentage } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, AlertCircle, TrendingUp } from "lucide-react";

// Dynamic import for recharts to handle missing dependency gracefully
let PieChartComponent: any = null;
let Cell: any = null;
let ResponsiveContainer: any = null;
let Tooltip: any = null;
let Legend: any = null;

try {
  const recharts = require("recharts");
  PieChartComponent = recharts.PieChart;
  Cell = recharts.Cell;
  ResponsiveContainer = recharts.ResponsiveContainer;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
} catch (error) {
  // Recharts not installed, will show fallback
}

interface PortfolioChartProps {
  address: string;
  network: Network;
}

/**
 * Portfolio chart component
 *
 * @remarks
 * Uses Recharts for token distribution pie chart with dark mode compatible colors
 * Responsive sizing (mobile-optimized) and handles empty state (no tokens)
 * Falls back to simple list view if recharts is not available
 */
export function PortfolioChart({ address, network }: PortfolioChartProps) {
  const { data, isLoading, error } = usePortfolio(address, network);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data) return [];

    const items = [];

    // Add ETH if it has value
    const ethValue = parseFloat(data.ethBalance.usdValue);
    if (ethValue > 0) {
      items.push({
        name: "ETH",
        symbol: "ETH",
        value: ethValue,
        color: "#627EEA", // Ethereum blue
      });
    }

    // Add tokens with value > 0
    data.tokens.forEach((token, index) => {
      const value = parseFloat(token.usdValue);
      if (value > 0) {
        items.push({
          name:
            token.name.length > 15
              ? `${token.name.slice(0, 15)}...`
              : token.name,
          symbol: token.symbol,
          value,
          color: CHART_COLORS[index % CHART_COLORS.length],
        });
      }
    });

    // Sort by value (descending)
    return items.sort((a, b) => b.value - a.value);
  }, [data]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-48 h-48 rounded-full" />
            <div className="grid grid-cols-2 gap-4 w-full">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
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
            <PieChart className="h-5 w-5" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Chart</h3>
            <p className="text-muted-foreground">
              Unable to load portfolio distribution data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assets to Display</h3>
            <p className="text-muted-foreground">
              This wallet doesn't have any assets with USD value on{" "}
              {network === "mainnet" ? "Ethereum Mainnet" : "Sepolia Testnet"}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback view if recharts is not available
  if (!PieChartComponent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Install recharts for interactive chart view
            </p>
            {chartData.map((item, index) => {
              const percentage = (item.value / totalValue) * 100;
              return (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{item.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatUSD(item.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(percentage)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recharts view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Portfolio Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChartComponent>
              <PieChartComponent
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </PieChartComponent>
              <Tooltip
                formatter={(value: number) => [formatUSD(value), "Value"]}
                labelFormatter={(label: string) => `${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                formatter={(value: string, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {entry.payload.symbol} (
                    {formatPercentage((entry.payload.value / totalValue) * 100)}
                    )
                  </span>
                )}
              />
            </PieChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Legend for mobile */}
        <div className="grid grid-cols-2 gap-2 mt-4 md:hidden">
          {chartData.map((item) => {
            const percentage = (item.value / totalValue) * 100;
            return (
              <div key={item.symbol} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(percentage)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Dark mode compatible color palette
const CHART_COLORS = [
  "#627EEA", // Ethereum blue
  "#F7931A", // Bitcoin orange
  "#26A17B", // Tether green
  "#3C3C3D", // USDC dark
  "#E84142", // BNB red
  "#8247E5", // Polygon purple
  "#FF6B35", // Chainlink orange
  "#00D4AA", // Maker teal
  "#F0B90B", // Binance yellow
  "#1652F0", // Coinbase blue
  "#FF4785", // Uniswap pink
  "#2775CA", // Compound blue
];
