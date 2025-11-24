import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AlchemyProvider } from "@/blockchain/providers/alchemy.provider";
import { EtherscanProvider } from "@/blockchain/providers/etherscan.provider";
import { CoingeckoProvider } from "@/blockchain/providers/coingecko.provider";
import { BlockchainService } from "@/blockchain/blockchain.service";

@Module({
  imports: [HttpModule],
  providers: [
    AlchemyProvider,
    EtherscanProvider,
    CoingeckoProvider,
    BlockchainService,
  ],
  exports: [
    AlchemyProvider,
    EtherscanProvider,
    CoingeckoProvider,
    BlockchainService,
  ],
})
export class BlockchainModule {}
