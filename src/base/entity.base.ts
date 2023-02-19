import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity as TypeOrmBaseEntity } from "typeorm";
  
export class BaseEntity extends TypeOrmBaseEntity {
    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    lastUpdatedDate: Date
}