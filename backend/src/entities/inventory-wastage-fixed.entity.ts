import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { InventoryBatch } from './inventory-batch.entity';
import { User } from './user.entity';

export enum WastageReason {
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CONTAMINATION = 'CONTAMINATION',
  PROCESSING_LOSS = 'PROCESSING_LOSS',
  OTHER = 'OTHER',
}

@Entity('inventory_wastage')
export class InventoryWastage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  batchId: string;

  @ManyToOne(() => InventoryBatch, { nullable: true })
  @JoinColumn({ name: 'batchId' })
  batch: InventoryBatch;

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
  reportedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedById' })
  reportedBy: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
