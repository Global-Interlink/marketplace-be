import { Auction } from './../sale_item/entities/auction.entity';
import { SaleItemModule } from './../sale_item/sale_item.module';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SaleItem } from '../sale_item/entities/sale_item.entity';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { SaleItemService } from '../sale_item/sale_item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      SaleItem,
      NFT,
      Auction
    ]),
    SaleItemModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    SaleItemService
  ],
  exports : [OrderService]
})
export class OrderModule {}
