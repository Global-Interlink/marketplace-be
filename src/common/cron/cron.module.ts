import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { NftService } from 'src/nft_collection/resources/nft/nft.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/blockchain/entities/address.entity';
import { Network } from 'src/blockchain/entities/network.entity';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { OrderModule } from 'src/marketplace/order/order.module';
import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { User } from 'src/user/entities/user.entity';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { NftCollectionService } from 'src/nft_collection/resources/nft_collection/nft_collection.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { UserService } from 'src/user/user.service';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { NftCollectionModule } from 'src/nft_collection/nft_collection.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { SignMessage } from 'src/user/entities/signmessage.entity';
import { EventLog } from 'src/blockchain/entities/event.entity';
import { OrderService } from 'src/marketplace/order/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Network,
      Address,
      User,
      SaleItem,
      Auction,
      Order,
      NFT,
      NFTCollection,
      EventLog,
      SignMessage
    ]),
    OrderModule,
    NftCollectionModule,
    BlockchainModule
  ],
  providers: [CronService, NftService, NftCollectionService, BlockchainService, UserService, OrderService, SaleItemService, IpfsService],
  exports: [CronService],
  controllers: [CronController]
})
export class CronModule {}
