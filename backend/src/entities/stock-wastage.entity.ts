import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StockItem } from './stock-item.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

export enum WastageReason {
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CONTAMINATION = 'CONTAMINATION',
  PROCESSING_LOSS = 'PROCESSING_LOSS',
  OTHER = 'OTHER',
}

@Entity('stock_wastage')
export class StockWastage extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  stockItemId: string;

  @ManyToOne(() => StockItem)
  @JoinColumn({ name: 'stockItemId' })
  stockItem: StockItem;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: WastageReason,
    default: WastageReason.OTHER,
  })
  reason: WastageReason;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'uuid' })
  recordedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedById' })
  recordedBy: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;
}
