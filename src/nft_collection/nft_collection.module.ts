import { EventLog } from './../blockchain/entities/event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTCollection } from './entities/nft_collection.entity';
import { IpfsService } from './../common/ipfs/ipfs.service';

import { Module } from '@nestjs/common';
import { NftCollectionService } from './resources/nft_collection/nft_collection.service';
import { NftCollectionController } from './resources/nft_collection/nft_collection.controller';
import { NftController } from './resources/nft/nft.controller';
import { KioskController } from './resources/kiosk/kiosk.controller';
import { NFT } from './entities/nft.entity';
import { NftService } from './resources/nft/nft.service';
import { KioskService } from './resources/kiosk/kiosk.service';
import { NftPropertyService } from './resources/nft_property/nft_property.service';
import { NFTProperty } from './entities/nft_property.entity';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Network } from 'src/blockchain/entities/network.entity';
import { Address } from 'src/blockchain/entities/address.entity';
import { UserService } from 'src/user/user.service';
import { OrderService } from 'src/marketplace/order/order.service';
import { User } from 'src/user/entities/user.entity';
import { SignMessage } from 'src/user/entities/signmessage.entity';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NFTCollection,
      NFT,
      NFTProperty,
      Network,
      Address,
      User,
      SignMessage,
      Order,
      SaleItem,
      Auction,
      EventLog
    ]),
  ],
  controllers: [NftCollectionController, NftController, KioskController],
  providers: [
    NftCollectionService,
    NftService,
    IpfsService,
    NftPropertyService,
    BlockchainService,
    UserService,
    OrderService,
    SaleItemService,
    KioskService
  ],
  exports: [NftService, KioskService, UserService, OrderService, SaleItemService],
})
export class NftCollectionModule {}
