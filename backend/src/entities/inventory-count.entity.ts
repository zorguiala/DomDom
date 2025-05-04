import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';

export enum InventoryCountStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

@Entity('inventory_counts')
export class InventoryCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  countDate: Date;

  @Column({
    type: 'enum',
    enum: InventoryCountStatus,
    default: InventoryCountStatus.DRAFT
  })
  status: InventoryCountStatus;

  @Column({ type: 'uuid' })
  initiatedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiatedById' })
  initiatedBy: User;

  @Column({ type: 'uuid', nullable: true })
  completedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completedById' })
  completedBy: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @OneToMany(() => InventoryCountItem, item => item.inventoryCount, { cascade: true })
  items: InventoryCountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('inventory_count_items')
export class InventoryCountItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventoryCountId: string;

  @ManyToOne(() => InventoryCount, count => count.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryCountId' })
  inventoryCount: InventoryCount;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'uuid', nullable: true })
  batchId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  expectedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actualQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discrepancy: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ default: false })
  isReconciled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
