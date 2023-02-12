import { Auction } from './entities/auction.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCollectionModule } from './../../nft_collection/nft_collection.module';
import { Module } from '@nestjs/common';
import { SaleItemService } from './sale_item.service';
import { SaleItemController } from './sale_item.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleItem,
      Auction
    ]),
    NftCollectionModule,
  ],
  controllers: [SaleItemController],
  providers: [SaleItemService],
})
export class SaleItemModule {}
