import { Auction } from './../sale_item/entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bid,
      Auction
    ]),
  ],
  controllers: [BidController],
  providers: [BidService]
})
export class BidModule {}
