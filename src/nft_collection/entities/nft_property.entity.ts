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

  @ManyToOne(() => NFT, (nft) => nft.properties)
  nft: NFT;
}

@Entity()
export class TestProperty extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  // @ManyToOne(() => NFT, (nft) => nft.properties)
  // nft: NFT
}
