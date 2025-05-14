import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum StockTransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  PRODUCTION_IN = 'production_in',
  PRODUCTION_OUT = 'production_out',
  ADJUSTMENT = 'adjustment',
}

@Entity('stock_transactions')
export class StockTransaction extends BaseEntity {
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.stockTransactions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('enum', { enum: StockTransactionType })
  type: StockTransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('text', { nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @ManyToOne(() => User)
  createdBy: User;
}
