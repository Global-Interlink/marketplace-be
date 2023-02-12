import { BaseEntity } from './../../base/entity.base';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class SignMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @Column()
  message: string;

  @Column()
  expiredAt: Date;

  @Column()
  usedAt: Date;
}
