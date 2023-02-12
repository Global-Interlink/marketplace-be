import { BaseEntity } from './../../base/entity.base';
import { TEXT_MEDIUM } from './../../app.constants';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Address } from './address.entity';
import { CrawlHistory } from './crawl_history.entity';

@Entity()
export class Network extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: TEXT_MEDIUM,
  })
  network_id: string;

  @Column({
    nullable: true,
  })
  provider_url: string;

  @OneToMany(() => Address, (address) => address.network)
  addresses: Address[];

  @OneToMany(() => Address, (address) => address.network)
  crawls: CrawlHistory[];
}
