import { Module } from "@nestjs/common";
import { BlockchainModule } from "@/blockchain/blockchain.module";
import { WalletController } from "@/wallet/wallet.controller";
import { WalletService } from "@/wallet/wallet.service";

@Module({
  imports: [BlockchainModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
