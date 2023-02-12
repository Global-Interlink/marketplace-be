import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from './../../base/entity.base';
import { NFT } from './nft.entity';
import { Category } from './category.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class NFTCollection extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string
    
    @Column()
    description: string

    @ManyToOne(() => Category, (category) => category.collections, {
        nullable: true
    })
    category: Category

    @Column()
    logo: string;

    @Column({
        nullable: true
    })
    logoFileType: string;

    @Column()
    banner: string;

    @Column({
        nullable: true
    })
    bannerFileType: string;


    @Column()
    featuredImage: string;

    @Column({
        nullable: true
    })
    featuredImageFileType: string;

    @OneToMany(() => NFT, (nft) => nft.collection)
    nfts: NFT[]

    @ManyToOne(() => User, (user) => user.collections)
    creator: User
}
