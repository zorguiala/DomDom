import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  PRODUCTION_IN = 'production_in',
  PRODUCTION_OUT = 'production_out',
  ADJUSTMENT = 'adjustment',
  SALE_OUT = 'SALE_OUT',
  IN = 'in',
  OUT = 'out',
  WASTE = 'waste',
}

@Entity('inventory_transactions')
export class InventoryTransaction extends BaseEntity {
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.inventoryTransactions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('enum', { enum: TransactionType })
  type: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('text', { nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => User)
  createdBy: User;
}
