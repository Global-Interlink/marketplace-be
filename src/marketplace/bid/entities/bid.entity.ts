import { Auction } from './../../sale_item/entities/auction.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/base/entity.base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Min } from 'class-validator';

@Entity()
export class Bid extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bids)
  user: User;

  @Column({ type: 'decimal', precision: 24, scale: 6, default: 0 })
  @Min(0)
  price: number;

  @Column({
    nullable: true,
  })
  buyerSignature: string;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  auction: Auction;
}
