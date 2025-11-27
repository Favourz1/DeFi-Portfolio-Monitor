import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { ethers } from "ethers";
import { AlchemyTokenBalance } from "./interfaces/alchemy.interface";

/**
 * Alchemy API provider for blockchain data
 *
 * @remarks
 * Handles token balances, metadata, and ETH balances using Alchemy's API
 */
@Injectable()
export class AlchemyProvider {
  private readonly logger = new Logger(AlchemyProvider.name);
  private readonly alchemyUrls: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const mainnetKey = this.configService.get("alchemy.mainnet");
    const sepoliaKey = this.configService.get("alchemy.sepolia");

    this.alchemyUrls = {
      mainnet: `https://eth-mainnet.g.alchemy.com/v2/${mainnetKey}`,
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${sepoliaKey}`,
    };

    // Log configuration status (without exposing the actual keys)
    if (!mainnetKey) {
      this.logger.error("❌ ALCHEMY_API_KEY_MAINNET is not configured!");
    }

    if (!sepoliaKey) {
      this.logger.error("❌ ALCHEMY_API_KEY_SEPOLIA is not configured!");
    }
  }

  /**
   * Get ERC-20 token balances for an address
   *
   * @param address - Ethereum address
   * @param network - Network (mainnet or sepolia)
   * @returns Array of token balances
   */
  async getTokenBalances(
    address: string,
    network: "mainnet" | "sepolia"
  ): Promise<AlchemyTokenBalance[]> {
    try {
      const url = this.alchemyUrls[network];

      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address],
          id: 1,
        })
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const tokenBalances = response.data.result.tokenBalances;

      // Filter out zero balances
      return tokenBalances.filter(
        (token: AlchemyTokenBalance) =>
          token.tokenBalance !== "0x0" && token.tokenBalance !== "0x"
      );
    } catch (error) {
      this.logger.error(`Failed to fetch token balances: ${error.message}`);
      throw new HttpException(
        "Failed to fetch token balances from blockchain",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get token metadata (symbol, name, decimals)
   *
   * @param contractAddress - Token contract address
   * @param network - Network
   * @returns Token metadata
   */
  async getTokenMetadata(
    contractAddress: string,
    network: "mainnet" | "sepolia"
  ): Promise<{
    symbol: string;
    name: string;
    decimals: number;
    logo?: string;
  }> {
    try {
      const url = this.alchemyUrls[network];

      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: "2.0",
          method: "alchemy_getTokenMetadata",
          params: [contractAddress],
          id: 1,
        })
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to fetch token metadata: ${error.message}`);
      return {
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
      };
    }
  }

  /**
   * Get ETH balance for an address
   *
   * @param address - Ethereum address
   * @param network - Network
   * @returns ETH balance in wei as string
   */
  async getEthBalance(
    address: string,
    network: "mainnet" | "sepolia"
  ): Promise<string> {
    try {
      const url = this.alchemyUrls[network];

      const response = await firstValueFrom(
        this.httpService.post(url, {
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
          id: 1,
        })
      );

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return ethers.BigNumber.from(response.data.result).toString();
    } catch (error) {
      this.logger.error(`Failed to fetch ETH balance: ${error.message}`);
      throw new HttpException(
        "Failed to fetch ETH balance",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
