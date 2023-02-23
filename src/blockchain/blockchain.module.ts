import { Address } from './entities/address.entity';
import { Network } from './entities/network.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { SignMessage } from 'src/user/entities/signmessage.entity';
import { OrderService } from 'src/marketplace/order/order.service';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';
import { EventLog } from './entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Network,
      Address,
      EventLog,
      User,
      SignMessage,
      Order,
      SaleItem,
      NFT,
      Auction,
    ]),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService, UserService, OrderService, SaleItemService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
