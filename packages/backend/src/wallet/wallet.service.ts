import {
  Injectable,
  Logger,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ethers } from "ethers";
import { AlchemyProvider } from "@/blockchain/providers/alchemy.provider";
import { EtherscanProvider } from "@/blockchain/providers/etherscan.provider";
import { CoingeckoProvider } from "@/blockchain/providers/coingecko.provider";
import {
  TokenBalancesResponse,
  TokenBalance,
} from "@/common/interfaces/token.interface";
import {
  TransactionsResponse,
  Transaction,
  TransactionType,
  TransactionStatus,
} from "@/common/interfaces/transaction.interface";

/**
 * Wallet service for aggregating wallet data
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly alchemyProvider: AlchemyProvider,
    private readonly etherscanProvider: EtherscanProvider,
    private readonly coingeckoProvider: CoingeckoProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Get token balances with USD values for a wallet
   *
   * @param address - Wallet address
   * @param network - Network
   * @returns Token balances response
   */
  async getTokenBalances(
    address: string,
    network: "mainnet" | "sepolia"
  ): Promise<TokenBalancesResponse> {
    const cacheKey = `token_balances_${address}_${network}`;

    // Check cache (30 seconds TTL)
    const cached = await this.cacheManager.get<TokenBalancesResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch token balances and ETH balance in parallel
      const [tokenBalancesRaw, ethBalanceWei] = await Promise.all([
        this.alchemyProvider.getTokenBalances(address, network),
        this.alchemyProvider.getEthBalance(address, network),
      ]);

      // Get token metadata for all tokens
      const tokenMetadataPromises = tokenBalancesRaw.map((token) =>
        this.alchemyProvider.getTokenMetadata(token.contractAddress, network)
      );
      const tokenMetadata = await Promise.all(tokenMetadataPromises);

      // Get ETH price
      const ethPrice = await this.coingeckoProvider.getEthPrice();

      // Get token prices (only for mainnet)
      const contractAddresses = tokenBalancesRaw.map((t) => t.contractAddress);
      const tokenPrices = await this.coingeckoProvider.getTokenPrices(
        contractAddresses,
        network
      );

      // Calculate token balances with USD values
      const tokens: TokenBalance[] = tokenBalancesRaw.map((token, index) => {
        const metadata = tokenMetadata[index];
        const balanceBN = ethers.BigNumber.from(token.tokenBalance);
        const balance = ethers.utils.formatUnits(balanceBN, metadata.decimals);
        const price = tokenPrices.get(token.contractAddress.toLowerCase()) || 0;
        const usdValue = (parseFloat(balance) * price).toFixed(2);

        return {
          contractAddress: token.contractAddress,
          symbol: metadata.symbol,
          name: metadata.name,
          balance,
          decimals: metadata.decimals,
          usdValue,
          logo: metadata.logo,
        };
      });

      // Calculate ETH balance and USD value
      const ethBalance = ethers.utils.formatEther(ethBalanceWei);
      const ethUsdValue = (parseFloat(ethBalance) * ethPrice).toFixed(2);

      // Calculate total portfolio value
      const totalValue = (
        parseFloat(ethUsdValue) +
        tokens.reduce((sum, token) => sum + parseFloat(token.usdValue), 0)
      ).toFixed(2);

      // Sort tokens by USD value (descending)
      tokens.sort((a, b) => parseFloat(b.usdValue) - parseFloat(a.usdValue));

      const response: TokenBalancesResponse = {
        address,
        network,
        tokens,
        ethBalance: {
          balance: ethBalance,
          usdValue: ethUsdValue,
        },
        totalValue,
        lastUpdated: new Date().toISOString(),
      };

      // Cache for 30 seconds
      await this.cacheManager.set(cacheKey, response, 30000);

      return response;
    } catch (error) {
      this.logger.error(`Failed to get token balances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transaction history for a wallet
   *
   * @param address - Wallet address
   * @param network - Network
   * @param limit - Number of transactions per page
   * @param offset - Offset for pagination
   * @param type - Transaction type filter
   * @param search - Search term
   * @returns Transactions response
   */
  async getTransactions(
    address: string,
    network: "mainnet" | "sepolia",
    limit: number,
    offset: number,
    type: "all" | "sent" | "received",
    search?: string
  ): Promise<TransactionsResponse> {
    const cacheKey = `transactions_${address}_${network}_${limit}_${offset}_${type}_${search || ""}`;

    // Check cache (60 seconds TTL)
    const cached = await this.cacheManager.get<TransactionsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const page = Math.floor(offset / limit) + 1;

      // Fetch ETH transactions and token transfers with individual error handling
      let normalTxs: any[] = [];
      let tokenTxs: any[] = [];

      try {
        normalTxs = await this.etherscanProvider.getNormalTransactions(
          address,
          network,
          page,
          limit
        );
      } catch (error) {
        this.logger.warn(
          `Failed to fetch normal transactions: ${error.message}`
        );
        // Continue with empty array if normal transactions fail
      }

      try {
        tokenTxs = await this.etherscanProvider.getTokenTransfers(
          address,
          network,
          page,
          limit
        );
      } catch (error) {
        this.logger.warn(`Failed to fetch token transfers: ${error.message}`);
        // Continue with empty array if token transfers fail
      }

      // Combine and transform transactions
      let transactions: Transaction[] = [];

      // Add ETH transfers
      transactions.push(
        ...normalTxs.map((tx) => ({
          hash: tx.hash,
          type: TransactionType.ETH_TRANSFER,
          from: tx.from,
          to: tx.to,
          value: ethers.utils.formatEther(tx.value),
          timestamp: parseInt(tx.timeStamp),
          usdValue: "0", // Would need historical price data
          status:
            tx.isError === "0"
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED,
          blockNumber: parseInt(tx.blockNumber),
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
        }))
      );

      // Add ERC-20 transfers
      transactions.push(
        ...tokenTxs.map((tx) => ({
          hash: tx.hash,
          type: TransactionType.ERC20_TRANSFER,
          from: tx.from,
          to: tx.to,
          value: ethers.utils.formatUnits(tx.value, parseInt(tx.tokenDecimal)),
          tokenSymbol: tx.tokenSymbol,
          tokenName: tx.tokenName,
          tokenAddress: tx.contractAddress,
          timestamp: parseInt(tx.timeStamp),
          usdValue: "0", // Would need historical price data
          status: TransactionStatus.SUCCESS, // Token transfers don't have isError field
          blockNumber: parseInt(tx.blockNumber),
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
        }))
      );

      // Sort by timestamp (descending)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      // Apply type filter
      if (type === "sent") {
        transactions = transactions.filter(
          (tx) => tx.from.toLowerCase() === address.toLowerCase()
        );
      } else if (type === "received") {
        transactions = transactions.filter(
          (tx) => tx.to.toLowerCase() === address.toLowerCase()
        );
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        transactions = transactions.filter(
          (tx) =>
            tx.hash.toLowerCase().includes(searchLower) ||
            tx.from.toLowerCase().includes(searchLower) ||
            tx.to.toLowerCase().includes(searchLower) ||
            tx.tokenSymbol?.toLowerCase().includes(searchLower) ||
            tx.tokenName?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const total = transactions.length;
      const paginatedTxs = transactions.slice(offset, offset + limit);

      const response: TransactionsResponse = {
        address,
        network,
        transactions: paginatedTxs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };

      // Cache for 60 seconds
      await this.cacheManager.set(cacheKey, response, 60000);

      return response;
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`);

      // Provide helpful error messages for common issues
      if (
        error.message.includes("API key") ||
        error.message.includes("NOTOK")
      ) {
        throw new HttpException(
          "API configuration error. Please check your environment variables.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw error;
    }
  }

  /**
   * Get complete portfolio data (combines token balances)
   *
   * @param address - Wallet address
   * @param network - Network
   * @returns Token balances response
   */
  async getPortfolio(
    address: string,
    network: "mainnet" | "sepolia"
  ): Promise<TokenBalancesResponse> {
    // Portfolio is same as token balances for now
    return this.getTokenBalances(address, network);
  }
}
