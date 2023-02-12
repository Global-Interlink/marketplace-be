import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { NftCollectionModule } from './nft_collection/nft_collection.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './marketplace/order/order.module';
import { SaleItemModule } from './marketplace/sale_item/sale_item.module';
import { BidModule } from './marketplace/bid/bid.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './common/cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    // DatabaseModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    BlockchainModule,
    NftCollectionModule,
    AuthModule,
    OrderModule,
    SaleItemModule,
    BidModule,
    CronModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
