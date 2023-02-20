import { NFT } from './nft.entity';
import { BaseEntity } from '../../base/entity.base';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NFTProperty extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column({ type: 'uuid', nullable: false })
  nftId!: string;

  @ManyToOne(() => NFT, (nft) => nft.properties)
  nft: NFT;
}
