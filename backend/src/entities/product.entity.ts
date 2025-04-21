import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOMItem } from './bom-item.entity';
import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  sku: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  unit: string;

  @Column({ default: false })
  isRawMaterial: boolean;

  @OneToMany(() => BOMItem, (bomItem) => bomItem.product)
  bomItems: BOMItem[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.product)
  inventoryTransactions: InventoryTransaction[];
}
