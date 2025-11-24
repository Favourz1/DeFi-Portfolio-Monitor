import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

/**
 * Etherscan API V2 provider for transaction history
 */
@Injectable()
export class EtherscanProvider {
  private readonly logger = new Logger(EtherscanProvider.name);
  private readonly etherscanV2Url = "https://api.etherscan.io/v2/api";
  private readonly apiKey: string;
  private readonly chainIds: Record<string, number>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.get("etherscan.apiKey");

    // Chain IDs for Etherscan API V2
    this.chainIds = {
      mainnet: 1,
      sepolia: 11155111,
    };

    if (!this.apiKey) {
      this.logger.error(
        "❌ ETHERSCAN_API_KEY is not configured! Please set up your environment variables."
      );
    }
  }

  /**
   * Get normal ETH transactions for an address using Etherscan API V2
   *
   * @param address - Ethereum address
   * @param network - Network
   * @param page - Page number
   * @param offset - Items per page
   * @returns Array of transactions
   */
  async getNormalTransactions(
    address: string,
    network: "mainnet" | "sepolia",
    page: number = 1,
    offset: number = 20
  ): Promise<any[]> {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error("Etherscan API key is not configured");
      }

      const chainId = this.chainIds[network];
      if (!chainId) {
        throw new Error(`Unsupported network: ${network}`);
      }

      // Etherscan API V2 parameters
      const params = {
        chainid: chainId.toString(),
        module: "account",
        action: "txlist",
        address: address.toLowerCase(),
        startblock: "0",
        endblock: "99999999",
        page: page.toString(),
        offset: offset.toString(),
        sort: "desc",
        apikey: this.apiKey,
      };
      const response = await firstValueFrom(
        this.httpService.get(this.etherscanV2Url, { params })
      );

      // Handle different response scenarios
      if (response.data.status === "0") {
        if (response.data.message === "No transactions found") {
          this.logger.debug("No transactions found for address");
          return [];
        } else if (response.data.message === "NOTOK") {
          throw new Error(
            `Etherscan API V2 error: ${response.data.result || "Invalid request"}`
          );
        } else {
          throw new Error(`Etherscan API V2 error: ${response.data.message}`);
        }
      }

      return response.data.result || [];
    } catch (error) {
      this.logger.error(
        `Failed to fetch normal transactions for ${address}: ${error.message}`
      );

      // Don't throw HTTP exception for API errors, let the service handle it
      if (error.message.includes("Etherscan API")) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch transaction history",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get ERC-20 token transfer events for an address using Etherscan API V2
   *
   * @param address - Ethereum address
   * @param network - Network
   * @param page - Page number
   * @param offset - Items per page
   * @returns Array of token transfers
   */
  async getTokenTransfers(
    address: string,
    network: "mainnet" | "sepolia",
    page: number = 1,
    offset: number = 20
  ): Promise<any[]> {
    try {
      // Validate API key
      if (!this.apiKey) {
        throw new Error("Etherscan API key is not configured");
      }

      const chainId = this.chainIds[network];
      if (!chainId) {
        throw new Error(`Unsupported network: ${network}`);
      }

      // Etherscan API V2 parameters
      const params = {
        chainid: chainId.toString(),
        module: "account",
        action: "tokentx",
        address: address.toLowerCase(),
        startblock: "0",
        endblock: "99999999",
        page: page.toString(),
        offset: offset.toString(),
        sort: "desc",
        apikey: this.apiKey,
      };

      const response = await firstValueFrom(
        this.httpService.get(this.etherscanV2Url, { params })
      );

      // Handle different response scenarios
      if (response.data.status === "0") {
        if (response.data.message === "No transactions found") {
          this.logger.debug("No token transfers found for address");
          return [];
        } else if (response.data.message === "NOTOK") {
          throw new Error(
            `Etherscan API V2 error: ${response.data.result || "Invalid request"}`
          );
        } else {
          throw new Error(`Etherscan API V2 error: ${response.data.message}`);
        }
      }

      return response.data.result || [];
    } catch (error) {
      this.logger.error(
        `Failed to fetch token transfers for ${address}: ${error.message}`
      );

      // Don't throw HTTP exception for API errors, let the service handle it
      if (error.message.includes("Etherscan API")) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch token transfer history",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
