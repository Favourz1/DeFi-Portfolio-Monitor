import { WalletConnection } from "@/components/Wallet/WalletConnection";
import { NetworkSelector } from "@/components/Wallet/NetworkSelector";
import { PortfolioOverview } from "@/components/Portfolio/PortfolioOverview";
import { TokenBalanceList } from "@/components/Tokens/TokenBalanceList";
import { TransactionHistory } from "@/components/Transactions/TransactionHistory";
import { useWallet } from "@/hooks/useWallet";

/**
 * Home page component - main dashboard for the DeFi Portfolio Tracker
 *
 * @remarks
 * Displays wallet connection, portfolio overview, token balances, and transaction history
 * when wallet is connected. Shows connection prompt when wallet is not connected.
 */
export function Home() {
  const { isConnected, address, network } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DeFi Portfolio Tracker</h1>
          <div className="flex items-center gap-4">
            {isConnected && <NetworkSelector />}
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8">
              Connect your MetaMask wallet to view your portfolio
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <PortfolioOverview address={address!} network={network} />
            <TokenBalanceList address={address!} network={network} />
            <TransactionHistory address={address!} network={network} />
          </div>
        )}
      </main>
    </div>
  );
}
