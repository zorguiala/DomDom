import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { StockTransactionType } from '../stock/types/stock.types';

/**
 * StockTransaction entity - simplified version without circular references
 * Records all stock movements (purchases, sales, adjustments, etc.)
 */
@Entity('stock_transactions')
export class StockTransaction extends BaseEntity {
  @Column()
  stockItemId: string;

  // Using string literal to avoid circular imports
  @ManyToOne('StockItem')
  @JoinColumn({ name: 'stockItemId' })
  stockItem: any;

  @Column({
    type: 'enum',
    enum: StockTransactionType,
  })
  type: StockTransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column('text', { nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  reason: string;
  
  @Column({ nullable: true })
  sourceLocation: string;
  
  @Column({ nullable: true })
  destinationLocation: string;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @Column({ nullable: true })
  performedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy: User;
}
