import { Auction } from './../../marketplace/sale_item/entities/auction.entity';
import { SaleItemBuyType } from './../../marketplace/sale_item/sale_item.constants';
import { NFTProperty } from './nft_property.entity';
import { User } from '../../user/entities/user.entity';
import { NFTState } from './../constants/nft.constants';
import { BaseEntity } from './../../base/entity.base';
import { NFTCollection } from './nft_collection.entity';
import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';
import { Exclude } from 'class-transformer';
import * as dotenv from 'dotenv';
dotenv.config();
@Entity()
export class NFT extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  onChainId: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  image: string;

  @Column({
    nullable: true,
  })
  fileType: string;

  @Column({
    nullable: true,
  })
  kioksId: string

  @OneToMany(() => NFTProperty, (property) => property.nft)
  properties: NFTProperty[];

  @Column({
    type: 'enum',
    enum: NFTState,
    default: NFTState.MINTED,
  })
  state: NFTState;

  @Column({ type: 'uuid', nullable: false })
  collectionId!: string;

  @ManyToOne(() => NFTCollection, (nftCollection) => nftCollection.nfts, {
    nullable: true,
  })
  collection: NFTCollection;

  @Column({ type: 'uuid', nullable: false })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.ownedNfts)
  owner: User;

  @Column({
    nullable: true,
  })
  ownedDate: Date;

  @Column({
    nullable: true,
  })
  nftType: string;

  @Exclude()
  @OneToMany(() => SaleItem, (saleItem) => saleItem.nft)
  saleItems: SaleItem[];

  saleStatus: {
    onSale: boolean;
    price: number;
    usdPrice: number;
    saleItemId: string;
    buyType: SaleItemBuyType;
    auction: Auction;
    hasExpired: boolean;
  };

  @Exclude()
  @AfterLoad()
  onSale = () => {
    this.saleStatus = null;
    if (this.saleItems) {
      const onSale = this.saleItems.find(
        (saleItem) => saleItem.state === SaleItemState.ON_SALE,
      );
      if (onSale) {
        const usdPrice =
          Number(onSale.price) * Number(process.env.USD_CONVERSION || 1);
        this.saleStatus = {
          onSale: true,
          price: onSale.price,
          usdPrice: +usdPrice.toFixed(2),
          saleItemId: onSale.id,
          buyType: onSale.buy_type,
          auction: onSale.auction,
          hasExpired: Boolean(
            onSale.buy_type == SaleItemBuyType.AUCTION &&
              onSale.auction.expiredAt < new Date(),
          ),
        };
      }
    }
    return this.saleStatus;
  };

  constructor(partial: Partial<NFT>) {
    super();
    Object.assign(this, partial);
  }
}
