import { BaseEntity } from '../../base/entity.base';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Network extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionId: string;

  @Column()
  eventId: string;

  @Column()
  raw_data: string;
}
