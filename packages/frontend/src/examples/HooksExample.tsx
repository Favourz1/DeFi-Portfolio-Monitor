import {
  useWallet,
  useTokenBalances,
  useTransactions,
  usePortfolio,
} from "@/hooks";
import { formatAddress, formatUSD, formatTokenBalance } from "@/utils";

/**
 * Example component demonstrating the usage of custom hooks
 *
 * This is for demonstration purposes and shows how the hooks
 * integrate together in a real component.
 */
export function HooksExample() {
  const { address, network, isConnected, connect, isConnecting } = useWallet();

  const {
    data: tokenBalances,
    isLoading: isLoadingTokens,
    error: tokenError,
  } = useTokenBalances(address, network);

  const {
    data: portfolio,
    isLoading: isLoadingPortfolio,
    error: portfolioError,
  } = usePortfolio(address, network);

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionError,
    fetchNextPage,
    hasNextPage,
  } = useTransactions({
    address,
    network,
    type: "all",
    search: "",
  });

  if (!isConnected) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
        <button
          onClick={connect}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Wallet Connected</h2>
        <p>Address: {formatAddress(address!)}</p>
        <p>Network: {network}</p>
      </div>

      {/* Portfolio Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
        {isLoadingPortfolio && <p>Loading portfolio...</p>}
        {portfolioError && (
          <p className="text-red-500">Error: {portfolioError.message}</p>
        )}
        {portfolio && (
          <div>
            <p className="text-2xl font-bold">
              {formatUSD(portfolio.totalValue)}
            </p>
            <p>
              ETH: {formatTokenBalance(portfolio.ethBalance.balance)} (
              {formatUSD(portfolio.ethBalance.usdValue)})
            </p>
            <p>Tokens: {portfolio.tokens.length}</p>
          </div>
        )}
      </div>

      {/* Token Balances */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Token Balances</h3>
        {isLoadingTokens && <p>Loading tokens...</p>}
        {tokenError && (
          <p className="text-red-500">Error: {tokenError.message}</p>
        )}
        {tokenBalances && (
          <div className="space-y-2">
            {tokenBalances.tokens.map((token) => (
              <div key={token.contractAddress} className="flex justify-between">
                <span>{token.symbol}</span>
                <span>
                  {formatTokenBalance(token.balance)} (
                  {formatUSD(token.usdValue)})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
        {isLoadingTransactions && <p>Loading transactions...</p>}
        {transactionError && (
          <p className="text-red-500">Error: {transactionError.message}</p>
        )}
        {transactionsData && (
          <div className="space-y-2">
            {transactionsData.pages.map((page) =>
              page.transactions.slice(0, 5).map((tx) => (
                <div key={tx.hash} className="border p-2 rounded">
                  <p>Type: {tx.type}</p>
                  <p>From: {formatAddress(tx.from)}</p>
                  <p>To: {formatAddress(tx.to)}</p>
                  <p>
                    Value: {formatTokenBalance(tx.value)}{" "}
                    {tx.tokenSymbol || "ETH"}
                  </p>
                </div>
              ))
            )}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
