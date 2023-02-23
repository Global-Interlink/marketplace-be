import { BaseEntity } from '../../base/entity.base';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class EventLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionId: string;

  @Column()
  eventId: string;

  @Column()
  timestamp: string;

  @Column()
  rawData: string;
}
