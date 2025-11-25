import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  variant: "portfolio" | "tokenList" | "transactionList" | "card";
  count?: number;
}

/**
 * Reusable loading skeleton component
 *
 * @remarks
 * Provides consistent loading states across the application with different
 * variants for different content types. Dark mode compatible.
 */
export function LoadingSkeleton({ variant, count = 3 }: LoadingSkeletonProps) {
  switch (variant) {
    case "portfolio":
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total value */}
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>

            {/* ETH balance */}
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Chart placeholder */}
            <div className="flex justify-center py-8">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          </CardContent>
        </Card>
      );

    case "tokenList":
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {/* Token logo */}
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    {/* Token symbol */}
                    <Skeleton className="h-4 w-16" />
                    {/* Token name */}
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {/* Balance */}
                  <Skeleton className="h-4 w-20" />
                  {/* USD value */}
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );

    case "transactionList":
      return (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left side */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <Skeleton className="h-4 w-4 mt-1 rounded-full" />
                    <div className="flex-1 space-y-2">
                      {/* Transaction type */}
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      {/* Addresses */}
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      {/* Mobile amount (hidden on desktop) */}
                      <div className="sm:hidden space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  {/* Right side (desktop only) */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case "card":
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
  }
}
