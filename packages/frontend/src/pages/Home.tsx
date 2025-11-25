import { useState } from "react";
import { WalletConnection } from "@/components/Wallet/WalletConnection";
import { NetworkSelector } from "@/components/Wallet/NetworkSelector";
import { ManualAddressInput } from "@/components/Wallet/ManualAddressInput";
import { PortfolioOverview } from "@/components/Portfolio/PortfolioOverview";
import { TokenBalanceList } from "@/components/Tokens/TokenBalanceList";
import { TransactionHistory } from "@/components/Transactions/TransactionHistory";
import { ThemeToggle } from "@/components/Layout/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Search, X } from "lucide-react";
import { PortfolioChart } from "@/components";

/**
 * Home page component - main dashboard for the DeFi Portfolio Tracker
 *
 * @remarks
 * Displays wallet connection, portfolio overview, token balances, and transaction history
 * when wallet is connected. Shows connection prompt when wallet is not connected.
 * Includes manual address input for viewing portfolios without connecting wallet.
 */
export function Home() {
  const { isConnected, address, network, isManualMode, clearManualAddress } =
    useWallet();
  const [showManualInput, setShowManualInput] = useState(false);

  /**
   * Handle manual address input completion
   */
  const handleManualAddressSet = () => {
    setShowManualInput(false);
  };

  /**
   * Handle clearing manual address
   */
  const handleClearManualAddress = () => {
    clearManualAddress();
    setShowManualInput(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-4 md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">DeFi Portfolio Tracker</h1>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2">
              {isConnected && <NetworkSelector />}
              <WalletConnection />
              {isManualMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearManualAddress}
                  className="self-start cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Manual Address
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              DeFi Portfolio Tracker{" "}
              <sub className="text-xs text-muted-foreground">
                by Favour Okoh
              </sub>
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isConnected && <NetworkSelector />}
              <WalletConnection />
              {isManualMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearManualAddress}
                  className="cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Manual Address
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8">
                Connect your MetaMask wallet to view your portfolio
              </p>
            </div>

            {/* Manual Address Input Section */}
            <div className="text-center">
              {!showManualInput ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Can't connect wallet?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowManualInput(true)}
                    className="cursor-pointer"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    View Any Wallet Address
                  </Button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <ManualAddressInput
                    onAddressSet={handleManualAddressSet}
                    onCancel={() => setShowManualInput(false)}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <PortfolioOverview address={address!} network={network} />
            <PortfolioChart address={address!} network={network} />
            <TokenBalanceList address={address!} network={network} />
            <TransactionHistory address={address!} network={network} />
          </div>
        )}
      </main>
    </div>
  );
}
