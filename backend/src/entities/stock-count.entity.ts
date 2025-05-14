import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum StockCountStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  RECONCILED = 'reconciled',
}

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
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

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
