import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiServiceUnavailableResponse,
  ApiTooManyRequestsResponse,
  ApiBody,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { WalletService } from "@/wallet/wallet.service";
import {
  WalletAddressParam,
  NetworkQueryDto,
} from "@/common/dto/wallet-address.param";
import { TransactionsQueryDto } from "@/wallet/dto/transactions-query.dto";
import {
  WalletDemoDto,
  WalletDemoResponse,
} from "@/wallet/dto/wallet-demo.dto";
import { ApiResponse as ApiResponseInterface } from "@/common/interfaces/api-response.interface";
import { TokenBalancesResponse } from "@/common/interfaces/token.interface";
import { TransactionsResponse } from "@/common/interfaces/transaction.interface";

/**
 * Wallet controller for wallet-related endpoints
 *
 * @remarks
 * Provides endpoints for fetching wallet token balances, transaction history,
 * and portfolio data. All endpoints are rate-limited and return standardized
 * API responses.
 */
@ApiTags("wallet")
@Controller("wallet")
@UseGuards(ThrottlerGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get token balances for a wallet
   *
   * @remarks
   * Fetches ERC-20 token balances and ETH balance for a given wallet address.
   * Includes USD values calculated using CoinGecko prices. Results are cached
   * for 30 seconds to reduce API calls.
   *
   * @param params - Wallet address parameter
   * @param query - Network selection (mainnet or sepolia)
   * @returns Token balances with USD values
   */
  @Get(":address/tokens")
  @ApiOperation({
    summary: "Get token balances",
    description:
      "Retrieve ERC-20 token balances and ETH balance for a wallet address with USD values. Results are cached for 30 seconds.",
  })
  @ApiParam({
    name: "address",
    description: "Ethereum wallet address (0x format)",
    example: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  })
  @ApiQuery({
    name: "network",
    description: "Network to query (mainnet or sepolia)",
    enum: ["mainnet", "sepolia"],
    required: false,
    example: "mainnet",
  })
  @ApiResponse({
    status: 200,
    description: "Token balances retrieved successfully",
    schema: {
      example: {
        error: false,
        message: "Token balances retrieved successfully",
        statusCode: 200,
        data: {
          address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
          network: "mainnet",
          tokens: [
            {
              contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              symbol: "USDC",
              name: "USD Coin",
              balance: "1000.00",
              decimals: 6,
              usdValue: "1000.00",
            },
          ],
          ethBalance: {
            balance: "1.5",
            usdValue: "3000.00",
          },
          totalValue: "4000.00",
          lastUpdated: "2024-01-01T00:00:00.000Z",
        },
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid wallet address format",
    schema: {
      example: {
        error: true,
        message: "Invalid Ethereum address format",
        statusCode: 400,
        data: null,
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: "External API failure (Alchemy, CoinGecko)",
    schema: {
      example: {
        error: true,
        message: "Failed to fetch token balances from blockchain",
        statusCode: 503,
        data: null,
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: "Rate limit exceeded",
    schema: {
      example: {
        error: true,
        message: "Too many requests, please try again later",
        statusCode: 429,
        data: null,
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  async getTokenBalances(
    @Param() params: WalletAddressParam,
    @Query() query: NetworkQueryDto
  ): Promise<ApiResponseInterface<TokenBalancesResponse>> {
    const data = await this.walletService.getTokenBalances(
      params.address,
      query.network
    );

    return {
      error: false,
      message: "Token balances retrieved successfully",
      statusCode: 200,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get transaction history for a wallet
   *
   * @remarks
   * Fetches ETH transfers and ERC-20 token transfers for a given wallet address.
   * Supports pagination, filtering by type (sent/received), and search functionality.
   * Results are cached for 60 seconds.
   *
   * @param params - Wallet address parameter
   * @param query - Transaction query parameters (pagination, filters, search)
   * @returns Transaction history with pagination metadata
   */
  @Get(":address/transactions")
  @ApiOperation({
    summary: "Get transaction history",
    description:
      "Retrieve ETH and ERC-20 token transfer history for a wallet address with pagination, filtering, and search. Results are cached for 60 seconds.",
  })
  @ApiParam({
    name: "address",
    description: "Ethereum wallet address (0x format)",
    example: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  })
  @ApiQuery({
    name: "network",
    description: "Network to query (mainnet or sepolia)",
    enum: ["mainnet", "sepolia"],
    required: false,
    example: "mainnet",
  })
  @ApiQuery({
    name: "limit",
    description: "Number of transactions per page (1-100)",
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: "offset",
    description: "Pagination offset",
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: "type",
    description: "Filter by transaction type",
    enum: ["all", "sent", "received"],
    required: false,
    example: "all",
  })
  @ApiQuery({
    name: "search",
    description:
      "Search term for transaction hash, addresses, or token symbols",
    required: false,
    type: String,
    example: "USDC",
  })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
    schema: {
      example: {
        error: false,
        message: "Transactions retrieved successfully",
        statusCode: 200,
        data: {
          address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
          network: "mainnet",
          transactions: [
            {
              hash: "0x123...",
              type: "eth_transfer",
              from: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
              to: "0x456...",
              value: "0.5",
              timestamp: 1704067200,
              usdValue: "1000.00",
              status: "success",
              blockNumber: 18000000,
              gasUsed: "21000",
              gasPrice: "20000000000",
            },
          ],
          pagination: {
            total: 100,
            limit: 20,
            offset: 0,
            hasMore: true,
          },
        },
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid wallet address format or query parameters",
  })
  @ApiServiceUnavailableResponse({
    description: "External API failure (Etherscan)",
  })
  @ApiTooManyRequestsResponse({
    description: "Rate limit exceeded",
  })
  async getTransactions(
    @Param() params: WalletAddressParam,
    @Query() query: TransactionsQueryDto
  ): Promise<ApiResponseInterface<TransactionsResponse>> {
    const data = await this.walletService.getTransactions(
      params.address,
      query.network,
      query.limit,
      query.offset,
      query.type,
      query.search
    );

    return {
      error: false,
      message: "Transactions retrieved successfully",
      statusCode: 200,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get complete portfolio data for a wallet
   *
   * @remarks
   * Returns complete portfolio data including token balances, ETH balance,
   * and total portfolio value. Currently returns the same data as the tokens
   * endpoint, but may be extended in the future to include additional analytics.
   *
   * @param params - Wallet address parameter
   * @param query - Network selection (mainnet or sepolia)
   * @returns Portfolio data with token balances and total value
   */
  @Get(":address/portfolio")
  @ApiOperation({
    summary: "Get portfolio data",
    description:
      "Retrieve complete portfolio data for a wallet address including token balances, ETH balance, and total value. Results are cached for 30 seconds.",
  })
  @ApiParam({
    name: "address",
    description: "Ethereum wallet address (0x format)",
    example: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  })
  @ApiQuery({
    name: "network",
    description: "Network to query (mainnet or sepolia)",
    enum: ["mainnet", "sepolia"],
    required: false,
    example: "mainnet",
  })
  @ApiResponse({
    status: 200,
    description: "Portfolio data retrieved successfully",
    schema: {
      example: {
        error: false,
        message: "Portfolio data retrieved successfully",
        statusCode: 200,
        data: {
          address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
          network: "mainnet",
          tokens: [],
          ethBalance: {
            balance: "1.5",
            usdValue: "3000.00",
          },
          totalValue: "3000.00",
          lastUpdated: "2024-01-01T00:00:00.000Z",
        },
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid wallet address format",
  })
  @ApiServiceUnavailableResponse({
    description: "External API failure",
  })
  @ApiTooManyRequestsResponse({
    description: "Rate limit exceeded",
  })
  async getPortfolio(
    @Param() params: WalletAddressParam,
    @Query() query: NetworkQueryDto
  ): Promise<ApiResponseInterface<TokenBalancesResponse>> {
    const data = await this.walletService.getPortfolio(
      params.address,
      query.network
    );

    return {
      error: false,
      message: "Portfolio data retrieved successfully",
      statusCode: 200,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get Wagmi v2 wallet integration demo and documentation
   *
   * @remarks
   * This endpoint provides documentation and examples for integrating the backend
   * API with Wagmi v2 hooks in the frontend. It demonstrates how to use wallet
   * addresses from Wagmi with the backend API endpoints.
   *
   * @param body - Wallet demo request with address and network
   * @returns Demo response with usage examples and API endpoint references
   */
  @Post("wallet-demo")
  @ApiOperation({
    summary: "Wagmi v2 wallet integration demo",
    description:
      "Get documentation and examples for using Wagmi v2 wallet hooks with the backend API. Provides code examples and API endpoint references.",
  })
  @ApiBody({
    type: WalletDemoDto,
    description: "Wallet address and network for demonstration",
  })
  @ApiResponse({
    status: 200,
    description: "Wallet demo data retrieved successfully",
    type: WalletDemoResponse,
    schema: {
      example: {
        error: false,
        message: "Wallet demo data retrieved successfully",
        statusCode: 200,
        data: {
          address: "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
          network: "mainnet",
          chainId: 1,
          wagmiUsage: {
            useAccount: "const { address, isConnected } = useAccount();",
            useChainId: "const chainId = useChainId();",
            useSwitchChain: "const { switchChain } = useSwitchChain();",
            useDisconnect: "const { disconnect } = useDisconnect();",
          },
          apiEndpoints: {
            getTokenBalances:
              "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/tokens?network=mainnet",
            getTransactions:
              "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/transactions?network=mainnet",
            getPortfolio:
              "/api/v1/wallet/0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503/portfolio?network=mainnet",
          },
          documentation: {
            wagmiDocs: "https://wagmi.sh/",
            rainbowKitDocs: "https://rainbowkit.com/docs",
            frontendHook: "See packages/frontend/src/hooks/useWallet.ts",
          },
        },
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid wallet address format",
  })
  async getWalletDemo(
    @Body() body: WalletDemoDto
  ): Promise<ApiResponseInterface<WalletDemoResponse>> {
    const network = body.network || "mainnet";
    const chainId = network === "mainnet" ? 1 : 11155111;

    const baseUrl = "/api/v1/wallet";
    const address = body.address;

    const data: WalletDemoResponse = {
      address,
      network,
      chainId,
      wagmiUsage: {
        useAccount: "const { address, isConnected } = useAccount();",
        useChainId: "const chainId = useChainId();",
        useSwitchChain: "const { switchChain } = useSwitchChain();",
        useDisconnect: "const { disconnect } = useDisconnect();",
      },
      apiEndpoints: {
        getTokenBalances: `${baseUrl}/${address}/tokens?network=${network}`,
        getTransactions: `${baseUrl}/${address}/transactions?network=${network}`,
        getPortfolio: `${baseUrl}/${address}/portfolio?network=${network}`,
      },
      documentation: {
        wagmiDocs: "https://wagmi.sh/",
        rainbowKitDocs: "https://rainbowkit.com/docs",
        frontendHook: "See packages/frontend/src/hooks/useWallet.ts",
      },
    };

    return {
      error: false,
      message: "Wallet demo data retrieved successfully",
      statusCode: 200,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
