import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { StockItem } from './stock-item.entity';
import { StockCountStatus } from '../stock/types/stock.types';

@Entity('stock_counts')
export class StockCount extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'date' })
  countDate: Date;

  @Column('enum', { enum: StockCountStatus, default: StockCountStatus.DRAFT })
  status: StockCountStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: false })
  isReconciled: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  reconciledAt: Date;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  reconciledBy: User;

  // Relationships will be defined in the StockCountItem entity
  // which will be created separately
}

@Entity('stock_count_items')
export class StockCountItem extends BaseEntity {
  @Column()
  stockCountId: string;

  @ManyToOne(() => StockCount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stockCountId' })
  stockCount: StockCount;

  @Column()
  stockItemId: string;

  @ManyToOne(() => StockItem)
  @JoinColumn({ name: 'stockItemId' })
  stockItem: StockItem;

  @Column('decimal', { precision: 10, scale: 2 })
  expectedQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discrepancy: number;

  @Column({ default: false })
  isReconciled: boolean;

  @Column('text', { nullable: true })
  notes: string;
}
