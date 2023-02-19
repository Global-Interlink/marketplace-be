import { User } from 'src/user/entities/user.entity';
import { OrderState } from './../order.constants';
import { BaseEntity } from './../../../base/entity.base';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { Min } from 'class-validator';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.order)
  saleItems: SaleItem[];

  @Column({ type: 'decimal', precision: 24, scale: 6, default: 0 })
  @Min(0)
  amount: number;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.NEW,
  })
  state: OrderState;

  @Column({type: 'uuid', nullable: false })
  buyerId!: string;

  @ManyToOne(() => User, (user) => user.orders)
  buyer: User;
}
