import { Bid } from './../../marketplace/bid/entities/bid.entity';
import { Order } from './../../marketplace/order/entities/order.entity';
import { NFT } from './../../nft_collection/entities/nft.entity';
import { NFTCollection } from './../../nft_collection/entities/nft_collection.entity';
import { BaseEntity } from './../../base/entity.base';
import { Address } from 'src/blockchain/entities/address.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Column,
  AfterLoad,
} from 'typeorm';
import { SignMessage } from './signmessage.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'uuid', nullable: false })
  addressId!: number;

  @OneToOne(() => Address, (address) => address.user)
  @JoinColumn()
  address: Address;

  @OneToMany(() => NFTCollection, (collection) => collection.creator)
  collections: NFTCollection[];

  @OneToMany(() => NFT, (nft) => nft.owner)
  ownedNfts: NFT[];

  @OneToMany(() => SignMessage, (signMessage) => signMessage.user)
  messages: SignMessage[];

  @OneToMany(() => SaleItem, (saleItem) => saleItem.publishedBy)
  publishedSaleItems: SaleItem[];

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];

  @OneToMany(() => Bid, (bid) => bid.user)
  bids: Bid[];
}
