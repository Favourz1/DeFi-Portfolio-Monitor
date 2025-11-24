import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { WalletService } from "@/wallet/wallet.service";
import {
  WalletAddressParam,
  NetworkQueryDto,
} from "@/common/dto/wallet-address.param";
import { TransactionsQueryDto } from "@/wallet/dto/transactions-query.dto";
import { ApiResponse } from "@/common/interfaces/api-response.interface";
import { TokenBalancesResponse } from "@/common/interfaces/token.interface";
import { TransactionsResponse } from "@/common/interfaces/transaction.interface";

/**
 * Wallet controller for wallet-related endpoints
 */
@Controller("wallet")
@UseGuards(ThrottlerGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * GET /api/v1/wallet/:address/tokens
   * Get token balances for a wallet
   *
   * @param params - Wallet address param
   * @param query - Network query
   * @returns Token balances with USD values
   */
  @Get(":address/tokens")
  async getTokenBalances(
    @Param() params: WalletAddressParam,
    @Query() query: NetworkQueryDto
  ): Promise<ApiResponse<TokenBalancesResponse>> {
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
   * GET /api/v1/wallet/:address/transactions
   * Get transaction history for a wallet
   *
   * @param params - Wallet address param
   * @param query - Transactions query with filters
   * @returns Transaction history with pagination
   */
  @Get(":address/transactions")
  async getTransactions(
    @Param() params: WalletAddressParam,
    @Query() query: TransactionsQueryDto
  ): Promise<ApiResponse<TransactionsResponse>> {
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
   * GET /api/v1/wallet/:address/portfolio
   * Get complete portfolio data for a wallet
   *
   * @param params - Wallet address param
   * @param query - Network query
   * @returns Portfolio data with token balances and total value
   */
  @Get(":address/portfolio")
  async getPortfolio(
    @Param() params: WalletAddressParam,
    @Query() query: NetworkQueryDto
  ): Promise<ApiResponse<TokenBalancesResponse>> {
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
}
