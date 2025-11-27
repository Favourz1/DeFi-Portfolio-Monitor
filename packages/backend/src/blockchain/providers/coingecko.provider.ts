import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { firstValueFrom } from "rxjs";

/**
 * CoinGecko API provider for token prices
 */
@Injectable()
export class CoingeckoProvider {
  private readonly logger = new Logger(CoingeckoProvider.name);
  private readonly baseUrl = "https://api.coingecko.com/api/v3";
  private readonly apiKey: string;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1100; // 1.1 seconds between requests for free tier

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.apiKey = this.configService.get("coingecko.apiKey");
  }

  /**
   * Rate limiting helper to prevent hitting API limits
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Get ETH price in USD
   *
   * @returns ETH price in USD
   */
  async getEthPrice(): Promise<number> {
    const cacheKey = "eth_price_usd";

    // Check cache first
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const headers = this.apiKey ? { "x-cg-pro-api-key": this.apiKey } : {};

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/simple/price`, {
          params: {
            ids: "ethereum",
            vs_currencies: "usd",
          },
          headers,
        })
      );

      const price = response.data.ethereum.usd;

      // Cache for 1 minute
      await this.cacheManager.set(cacheKey, price, 60000);

      return price;
    } catch (error) {
      this.logger.error(`Failed to fetch ETH price: ${error.message}`);
      // Return cached value if available, otherwise throw
      const fallback = await this.cacheManager.get<number>(cacheKey);
      if (fallback) {
        this.logger.warn("Using cached ETH price due to API error");
        return fallback;
      }
      throw new HttpException(
        "Failed to fetch ETH price",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get historical ETH price at a specific date
   *
   * @param timestamp - Unix timestamp
   * @returns ETH price in USD at that date
   */
  async getEthPriceAtDate(timestamp: number): Promise<number> {
    // Convert timestamp to date string (DD-MM-YYYY format required by CoinGecko)
    const date = new Date(timestamp * 1000);
    const dateString = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;

    const cacheKey = `eth_price_historical_${dateString}`;

    // Check cache first (cache historical prices for 24 hours)
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Apply rate limiting for free tier
      if (!this.apiKey) {
        await this.waitForRateLimit();
      }

      const headers = this.apiKey ? { "x-cg-pro-api-key": this.apiKey } : {};

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/ethereum/history`, {
          params: {
            date: dateString,
            localization: false,
          },
          headers,
          timeout: 10000, // 10 second timeout
        })
      );

      const price = response.data?.market_data?.current_price?.usd;

      if (!price) {
        this.logger.warn(
          `No historical price data found for ETH on ${dateString}`
        );
        // Fallback to current price if historical data is unavailable
        return this.getEthPrice();
      }

      // Cache historical prices for 24 hours (they don't change)
      await this.cacheManager.set(cacheKey, price, 86400000);

      return price;
    } catch (error) {
      this.logger.error(
        `Failed to fetch historical ETH price for ${dateString}: ${error.message}`
      );

      // Fallback to current price
      try {
        const currentPrice = await this.getEthPrice();
        this.logger.warn(
          `Using current ETH price as fallback for historical date ${dateString}`
        );
        return currentPrice;
      } catch (fallbackError) {
        this.logger.error(
          `Failed to get fallback ETH price: ${fallbackError.message}`
        );
        return 0;
      }
    }
  }

  /**
   * Get historical token price at a specific date
   *
   * @param contractAddress - Token contract address
   * @param timestamp - Unix timestamp
   * @param network - Network (mainnet or sepolia)
   * @returns Token price in USD at that date
   */
  async getTokenPriceAtDate(
    contractAddress: string,
    timestamp: number,
    network: "mainnet" | "sepolia"
  ): Promise<number> {
    // Only mainnet has reliable price data
    if (network === "sepolia") {
      this.logger.warn("Historical token prices not available for testnet");
      return 0;
    }

    // Convert timestamp to date string (DD-MM-YYYY format required by CoinGecko)
    const date = new Date(timestamp * 1000);
    const dateString = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;

    const cacheKey = `token_price_historical_${contractAddress.toLowerCase()}_${dateString}`;

    // Check cache first (cache historical prices for 24 hours)
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    try {
      // Apply rate limiting for free tier
      if (!this.apiKey) {
        await this.waitForRateLimit();
      }

      const headers = this.apiKey ? { "x-cg-pro-api-key": this.apiKey } : {};

      // First, try to get the coin ID from the contract address
      const coinListResponse = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/coins/ethereum/contract/${contractAddress.toLowerCase()}`,
          {
            headers,
            timeout: 10000, // 10 second timeout
          }
        )
      );

      const coinId = coinListResponse.data?.id;
      if (!coinId) {
        this.logger.warn(
          `No coin ID found for contract address ${contractAddress}`
        );
        // Cache the failure to avoid repeated API calls
        await this.cacheManager.set(cacheKey, 0, 86400000);
        return 0;
      }

      // Apply rate limiting for free tier before second request
      if (!this.apiKey) {
        await this.waitForRateLimit();
      }

      // Get historical price for the coin
      const historyResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/coins/${coinId}/history`, {
          params: {
            date: dateString,
            localization: false,
          },
          headers,
          timeout: 10000, // 10 second timeout
        })
      );

      const price = historyResponse.data?.market_data?.current_price?.usd;

      if (!price) {
        this.logger.warn(
          `No historical price data found for token ${contractAddress} on ${dateString}`
        );
        // Try to get current price as fallback
        const currentPrices = await this.getTokenPrices(
          [contractAddress],
          network
        );
        const fallbackPrice =
          currentPrices.get(contractAddress.toLowerCase()) || 0;

        // Cache the result (including 0 for unavailable prices)
        await this.cacheManager.set(cacheKey, fallbackPrice, 86400000);
        return fallbackPrice;
      }

      // Cache historical prices for 24 hours (they don't change)
      await this.cacheManager.set(cacheKey, price, 86400000);

      return price;
    } catch (error) {
      this.logger.error(
        `Failed to fetch historical token price for ${contractAddress} on ${dateString}: ${error.message}`
      );

      // Try to get current price as fallback
      try {
        const currentPrices = await this.getTokenPrices(
          [contractAddress],
          network
        );
        const fallbackPrice =
          currentPrices.get(contractAddress.toLowerCase()) || 0;
        this.logger.warn(
          `Using current token price as fallback for ${contractAddress} on ${dateString}`
        );

        // Cache the fallback result
        await this.cacheManager.set(cacheKey, fallbackPrice, 86400000);
        return fallbackPrice;
      } catch (fallbackError) {
        this.logger.error(
          `Failed to get fallback token price: ${fallbackError.message}`
        );
        // Cache the failure to avoid repeated API calls
        await this.cacheManager.set(cacheKey, 0, 86400000);
        return 0;
      }
    }
  }

  /**
   * Get historical prices for multiple transactions in batch
   * This method optimizes API calls by grouping requests by date
   *
   * @param transactions - Array of transaction objects with timestamp and type info
   * @param network - Network (mainnet or sepolia)
   * @returns Map of transaction hash to USD price
   */
  async getBatchHistoricalPrices(
    transactions: Array<{
      hash: string;
      timestamp: number;
      type: "eth" | "token";
      contractAddress?: string;
      value: string;
    }>,
    network: "mainnet" | "sepolia"
  ): Promise<Map<string, number>> {
    const priceMap = new Map<string, number>();

    // Group transactions by date to minimize API calls
    const transactionsByDate = new Map<
      string,
      Array<(typeof transactions)[0]>
    >();

    for (const tx of transactions) {
      const date = new Date(tx.timestamp * 1000);
      const dateString = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;

      if (!transactionsByDate.has(dateString)) {
        transactionsByDate.set(dateString, []);
      }
      transactionsByDate.get(dateString)!.push(tx);
    }

    // Process each date group
    for (const [dateString, dateTxs] of transactionsByDate) {
      // Get ETH price for this date (if needed)
      let ethPriceForDate: number | null = null;
      const ethTxs = dateTxs.filter((tx) => tx.type === "eth");

      if (ethTxs.length > 0) {
        try {
          ethPriceForDate = await this.getEthPriceAtDate(ethTxs[0].timestamp);
        } catch (error) {
          this.logger.warn(
            `Failed to get ETH price for date ${dateString}: ${error.message}`
          );
        }
      }

      // Calculate USD values for ETH transactions
      for (const tx of ethTxs) {
        if (ethPriceForDate !== null) {
          const usdValue = parseFloat(tx.value) * ethPriceForDate;
          priceMap.set(tx.hash, usdValue);
        } else {
          priceMap.set(tx.hash, 0);
        }
      }

      // Process token transactions
      const tokenTxs = dateTxs.filter((tx) => tx.type === "token");
      for (const tx of tokenTxs) {
        if (tx.contractAddress) {
          try {
            const tokenPrice = await this.getTokenPriceAtDate(
              tx.contractAddress,
              tx.timestamp,
              network
            );
            const usdValue = parseFloat(tx.value) * tokenPrice;
            priceMap.set(tx.hash, usdValue);
          } catch (error) {
            this.logger.warn(
              `Failed to get token price for ${tx.contractAddress} on ${dateString}: ${error.message}`
            );
            priceMap.set(tx.hash, 0);
          }
        } else {
          priceMap.set(tx.hash, 0);
        }
      }
    }

    return priceMap;
  }

  /**
   * Get token prices by contract addresses
   *
   * @param contractAddresses - Array of token contract addresses
   * @param network - Network (mainnet or sepolia)
   * @returns Map of contract address to USD price
   */
  async getTokenPrices(
    contractAddresses: string[],
    network: "mainnet" | "sepolia"
  ): Promise<Map<string, number>> {
    // Only mainnet has reliable price data
    if (network === "sepolia") {
      this.logger.warn("Token prices not available for testnet");
      return new Map();
    }

    if (contractAddresses.length === 0) {
      return new Map();
    }

    const cacheKey = `token_prices_${contractAddresses.join("_")}`;

    // Check cache first
    const cached = await this.cacheManager.get<Map<string, number>>(cacheKey);
    if (cached) {
      return new Map(Object.entries(cached));
    }

    try {
      const headers = this.apiKey ? { "x-cg-pro-api-key": this.apiKey } : {};

      // CoinGecko allows up to 250 addresses per request
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/simple/token_price/ethereum`, {
          params: {
            contract_addresses: contractAddresses.join(","),
            vs_currencies: "usd",
          },
          headers,
        })
      );

      const priceMap = new Map<string, number>();

      for (const [address, data] of Object.entries(response.data)) {
        if (data && typeof data === "object" && "usd" in data) {
          const priceData = data as { usd: number };
          priceMap.set(address.toLowerCase(), priceData.usd);
        }
      }

      // Cache for 1 minute
      await this.cacheManager.set(
        cacheKey,
        Object.fromEntries(priceMap),
        60000
      );

      return priceMap;
    } catch (error) {
      this.logger.error(`Failed to fetch token prices: ${error.message}`);
      // Return empty map on error (tokens will show no price)
      return new Map();
    }
  }
}
