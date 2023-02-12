import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Address } from 'src/blockchain/entities/address.entity';
import { Network } from 'src/blockchain/entities/network.entity';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { OrderModule } from 'src/marketplace/order/order.module';
import { OrderService } from 'src/marketplace/order/order.service';
import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { User } from 'src/user/entities/user.entity';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Network,
      Address,
      User,
      SaleItem,
      Auction,
      Order,
      NFT
    ]),
    OrderModule
  ],
  providers: [CronService, BlockchainService, SaleItemService,OrderService],
  exports: [CronService],
  controllers: [CronController]
})
export class CronModule {}
