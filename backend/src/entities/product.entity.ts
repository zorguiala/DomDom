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

  @Column({ nullable: true })
  barcode: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ default: true })
  isActive: boolean;
  
  @Column({ nullable: true, type: 'int' })
  leadTimeDays: number;
  
  @Column({ default: false })
  isRawMaterial: boolean;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  lastPurchasePrice: number;

  @OneToMany(() => BOMItem, (bomItem) => bomItem.product)
  bomItems: BOMItem[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.product)
  inventoryTransactions: InventoryTransaction[];
}
