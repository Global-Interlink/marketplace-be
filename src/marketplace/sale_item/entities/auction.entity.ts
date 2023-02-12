import { Bid } from './../../bid/entities/bid.entity';
import { AuctionMethod } from './../auction.constants';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { BaseEntity } from './../../../base/entity.base';
import { AfterLoad, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {
    Min,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

  
@Entity()
export class Auction extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @OneToOne(() => SaleItem, (item) => item.auction)
    saleItem: SaleItem

    @Column({
        nullable: true
    })
    expiredAt: Date

    @Column({type: "decimal", precision: 24, scale: 6, default: 0})
    @Min(0)
    startPrice: number

    @Column({
        type: "decimal", 
        precision: 24, 
        scale: 6, 
        default: 0,
        nullable: true
    })
    @Min(0)
    reservePrice: number

    @Column({
        type: "enum",
        enum: AuctionMethod,
        default: AuctionMethod.SELL_TO_HIGHEST_BIDDER
    })
    method: AuctionMethod

    @Exclude()
    @OneToMany(() => Bid, (bid) => bid.auction)
    bids: Bid[]

    highestBid: Bid = null;

    @Expose()
    maxBidPrice: number;

    @Exclude()
    @AfterLoad()
    getHighestBid = () => {
        if (this.bids) {
            const highestBids = this.bids.sort((a, b) => b.price - a.price);
            if (highestBids) {
                this.highestBid = highestBids[0];
            }
        }
        return this.highestBid;
    };

    @Exclude()
    @AfterLoad()
    getMaxBidPrice = () => {
        const highestBid = this.getHighestBid();
        if (highestBid) {
            this.maxBidPrice = highestBid.price;
        }
        return this.maxBidPrice;
    };
}
