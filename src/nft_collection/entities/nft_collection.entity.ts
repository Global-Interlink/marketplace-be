import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from './../../base/entity.base';
import { NFT } from './nft.entity';
import { Category } from './category.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class NFTCollection extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'uuid', nullable: false })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.collections, {
    nullable: true,
  })
  category: Category;

  @Column()
  logo: string;

  @Column({
    nullable: true,
  })
  logoFileType: string;

  @Column()
  banner: string;

  @Column({
    nullable: true,
  })
  bannerFileType: string;

  @Column()
  featuredImage: string;

  @Column({
    nullable: true,
  })
  featuredImageFileType: string;

  @OneToMany(() => NFT, (nft) => nft.collection)
  nfts: NFT[];

  @Column({ type: 'uuid', nullable: false })
  creatorId!: string;

  @ManyToOne(() => User, (user) => user.collections)
  creator: User;

  @Index()
  @Column({ nullable: true })
  nftUrls: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  facebook_url: string;

  @Column({ nullable: true })
  twitter_url: string;

  @Column({ nullable: true })
  github_url: string;

  @Column({ nullable: true })
  telegram_url: string;

  @Column({ nullable: true })
  instagram_url: string;

  @Column({ nullable: true })
  discord_url: string;

  @Column({ nullable: true })
  youtube_url: string;

  @Column({ nullable: true })
  reddit_url: string;
}
