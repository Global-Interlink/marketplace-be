import { BaseEntity } from '../../base/entity.base';
import { TEXT_MEDIUM } from '../../app.constants';
import { User } from "src/user/entities/user.entity"
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm"
import { Network } from "./network.entity"


@Entity()
export class CrawlHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fromBlockNumber: number

    @Column()
    toBlockNumber: number

    @ManyToOne(() => Network, (network) => network.addresses)
    network: Network
}
