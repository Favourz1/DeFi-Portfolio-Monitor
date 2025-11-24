import { Injectable } from "@nestjs/common";
import { AlchemyProvider } from "@/blockchain/providers/alchemy.provider";
import { EtherscanProvider } from "@/blockchain/providers/etherscan.provider";
import { CoingeckoProvider } from "@/blockchain/providers/coingecko.provider";

/**
 * Blockchain service that orchestrates all blockchain providers
 */
@Injectable()
export class BlockchainService {
  constructor(
    private readonly alchemyProvider: AlchemyProvider,
    private readonly etherscanProvider: EtherscanProvider,
    private readonly coingeckoProvider: CoingeckoProvider
  ) {}

  // Expose providers for use in wallet service
  get alchemy() {
    return this.alchemyProvider;
  }

  get etherscan() {
    return this.etherscanProvider;
  }

  get coingecko() {
    return this.coingeckoProvider;
  }
}
