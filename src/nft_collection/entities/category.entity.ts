import { BaseEntity } from './../../base/entity.base';
import { NFTCollection } from './nft_collection.entity';
import { TEXT_MEDIUM, TEXT_SUPER_SMALL } from './../../app.constants';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: TEXT_MEDIUM
    })
    name: string
    
    @Column({
        length: TEXT_SUPER_SMALL
    })
    code: string

    @OneToMany(() => NFTCollection, (collection) => collection.category)
    collections: NFTCollection[];
}
