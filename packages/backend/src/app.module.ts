import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { HttpModule } from "@nestjs/axios";
import configuration from "@/config/configuration";
import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { BlockchainModule } from "@/blockchain/blockchain.module";
import { WalletModule } from "@/wallet/wallet.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per TTL
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // Default TTL in seconds
      max: 100, // Maximum number of items in cache
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    BlockchainModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
