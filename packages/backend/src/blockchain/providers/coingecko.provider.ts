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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.apiKey = this.configService.get("coingecko.apiKey");
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
          priceMap.set(address.toLowerCase(), (data as any).usd);
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
