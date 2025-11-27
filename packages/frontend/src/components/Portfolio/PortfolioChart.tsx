import { useMemo } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Network } from "@/types/wallet.types";
import { formatUSD, formatPercentage } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, AlertCircle, TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import Decimal from "decimal.js";

interface PortfolioChartProps {
  address: string;
  network: Network;
}

/**
 * Chart data entry interface for type safety
 * Must match Recharts ChartDataInput type (with index signature)
 */
interface ChartDataEntry {
  name: string;
  symbol: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

/**
 * Recharts tooltip payload entry
 */
interface TooltipPayloadEntry {
  name: string;
  value: number;
  payload: ChartDataEntry;
  color: string;
}

/**
 * Custom tooltip props interface
 */
interface CustomTooltipProps extends TooltipProps<number, string> {
  totalValue: number;
  payload?: TooltipPayloadEntry[];
}

/**
 * Recharts Legend formatter entry type
 * All fields are optional to match Recharts' actual type structure
 */
interface LegendEntry {
  value?: string;
  type?: string;
  id?: string;
  color?: string;
  payload?: ChartDataEntry;
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

  // Prepare chart data using Decimal for precision
  const chartData = useMemo((): ChartDataEntry[] => {
    if (!data) return [];

    const items: ChartDataEntry[] = [];

    // Add ETH if it has value using Decimal
    const ethValue = new Decimal(data.ethBalance.usdValue);
    if (ethValue.gt(0)) {
      items.push({
        name: "ETH",
        symbol: "ETH",
        value: ethValue.toNumber(),
        color: "#627EEA", // Ethereum blue
      });
    }

    // Add tokens with value > 0 using Decimal
    data.tokens.forEach((token, index) => {
      const value = new Decimal(token.usdValue);
      if (value.gt(0)) {
        items.push({
          name:
            token.name.length > 15
              ? `${token.name.slice(0, 15)}...`
              : token.name,
          symbol: token.symbol,
          value: value.toNumber(),
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
            <RechartsPieChart>
              <Pie
                data={chartData as unknown as Array<Record<string, unknown>>}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease-out"
                isAnimationActive={true}
              >
                {chartData.map((entry: ChartDataEntry, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip totalValue={totalValue} />}
                cursor={{ fill: "transparent" }}
                animationDuration={200}
              />
              <Legend
                formatter={(_value: string, entry: unknown) => {
                  const legendEntry = entry as LegendEntry;
                  if (!legendEntry.payload) return _value;
                  const percentage = new Decimal(legendEntry.payload.value)
                    .div(totalValue)
                    .mul(100)
                    .toNumber();
                  return (
                    <span style={{ color: legendEntry.color }}>
                      {legendEntry.payload.symbol} (
                      {formatPercentage(percentage)})
                    </span>
                  );
                }}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend for mobile */}
        <div className="grid grid-cols-2 gap-2 mt-4 md:hidden">
          {chartData.map((item) => {
            // Use Decimal.js for percentage calculation (consistent with tooltip)
            const percentage = new Decimal(item.value)
              .div(totalValue)
              .mul(100)
              .toNumber();
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

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  totalValue,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) return null;

  const value = data.value;
  // Use Decimal for percentage calculation
  const percentage = new Decimal(value).div(totalValue).mul(100).toNumber();

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-lg",
        "p-3 min-w-[180px]",
        "backdrop-blur-sm"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: data.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.symbol}</p>
          {data.name !== data.symbol && (
            <p className="text-xs text-muted-foreground truncate">
              {data.name}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1 pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Value</span>
          <span className="text-sm font-semibold">{formatUSD(value)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Percentage</span>
          <span className="text-sm font-medium">
            {formatPercentage(percentage)}
          </span>
        </div>
      </div>
    </div>
  );
};

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
