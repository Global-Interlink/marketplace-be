import { Order } from './../../order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from './../../../base/entity.base';
import { NFT } from './../../../nft_collection/entities/nft.entity';
import { SaleItemType, SaleItemState, SaleItemBuyType } from './../sale_item.constants';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import {
    Min,
} from 'class-validator';
import { Auction } from './auction.entity';

  
@Entity()
export class SaleItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: "enum",
        enum: SaleItemType,
        default: SaleItemType.NFT,
    })
    type: SaleItemType

    @Column({
        type: "enum",
        enum: SaleItemBuyType,
        default: SaleItemBuyType.BUY_NOW
    })
    buy_type: SaleItemBuyType

    @OneToOne(() => Auction, (auction) => auction.saleItem, {
        nullable: true
    })
    @JoinColumn()
    auction: Auction

    @Column({type: 'uuid', nullable: false })
    nftId!: string;

    @ManyToOne(() => NFT, (nft) => nft.saleItems)
    nft: NFT

    @Column({type: "decimal", precision: 24, scale: 6, default: 0})
    // @Min(0)    
    price: number

    @Column({
        type: "enum",
        enum: SaleItemState,
        default: SaleItemState.ON_SALE,
    })
    state: SaleItemState

    @Column({
        nullable: true
    })
    lastChangedStateAt: Date

    @Column({type: 'uuid', nullable: false })
    publishedById!: string;

    @ManyToOne(() => User, (user) => user.publishedSaleItems)
    publishedBy: User

    @Column({type: 'uuid', nullable: false })
    orderId!: string;

    @ManyToOne(() => Order, (order) => order.saleItems)
    order: Order
}
