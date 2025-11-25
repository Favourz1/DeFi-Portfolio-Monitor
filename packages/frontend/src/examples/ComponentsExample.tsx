import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ErrorBoundary,
  ThemeProvider,
  ThemeToggle,
  WalletConnection,
  NetworkSelector,
} from "@/components";

/**
 * Example component demonstrating the usage of all implemented components
 *
 * @remarks
 * This component shows how to use the Layout and Wallet components
 * in a real application context
 */
export function ComponentsExample() {
  const [shouldError, setShouldError] = React.useState(false);

  // Component that throws an error for testing ErrorBoundary
  const ErrorComponent = () => {
    if (shouldError) {
      throw new Error("This is a test error for the ErrorBoundary");
    }
    return <div>No error here!</div>;
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with Theme Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>DeFi Portfolio Tracker - Components Demo</CardTitle>
                <ThemeToggle />
              </div>
            </CardHeader>
          </Card>

          {/* Wallet Connection Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Full Wallet Connection:
                </h4>
                <WalletConnection />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Network Selector:</h4>
                <NetworkSelector />
              </div>
            </CardContent>
          </Card>

          {/* Error Boundary Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Error Boundary Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShouldError(!shouldError)}
                  variant={shouldError ? "destructive" : "default"}
                  className="cursor-pointer"
                >
                  {shouldError ? "Fix Error" : "Trigger Error"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Click to test the ErrorBoundary component
                </span>
              </div>

              <ErrorBoundary>
                <div className="p-4 border rounded-md">
                  <ErrorComponent />
                </div>
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Component Status */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Layout Components</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ErrorBoundary - Catch and handle React errors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ThemeProvider - Dark/light mode support
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Wallet Components</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      WalletConnection - MetaMask integration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      NetworkSelector - Network switching
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <h4>Getting Started:</h4>
                <ol className="text-sm space-y-2">
                  <li>
                    1. Install MetaMask browser extension if not already
                    installed
                  </li>
                  <li>
                    2. Click "Connect Wallet" to connect your MetaMask wallet
                  </li>
                  <li>
                    3. Use the Network Selector to switch between Mainnet and
                    Sepolia
                  </li>
                  <li>
                    4. Toggle between light and dark themes using the theme
                    button
                  </li>
                  <li>
                    5. Test error handling by clicking the "Trigger Error"
                    button
                  </li>
                </ol>

                <h4 className="mt-4">Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Comprehensive error handling with retry mechanisms</li>
                  <li>• Responsive design that works on mobile and desktop</li>
                  <li>• Dark mode support with system preference detection</li>
                  <li>• Loading states and user feedback throughout</li>
                  <li>• Accessible components following WCAG guidelines</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}
