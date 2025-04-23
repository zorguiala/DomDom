import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOM } from './bom.entity';
import { User } from './user.entity';
import { ProductionRecord } from './production-record.entity';
import { ProductionOrderItem } from './production-order-item.entity';

export enum ProductionOrderStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProductionOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('production_orders')
export class ProductionOrder extends BaseEntity {
  @ManyToOne(() => BOM)
  @JoinColumn({ name: 'bom_id' })
  bom: BOM;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'enum', enum: ProductionOrderStatus, default: ProductionOrderStatus.PLANNED })
  status: ProductionOrderStatus;

  @Column({ type: 'enum', enum: ProductionOrderPriority, default: ProductionOrderPriority.MEDIUM })
  priority: ProductionOrderPriority;

  @Column({ type: 'timestamp' })
  plannedStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  completedQuantity: number;

  @ManyToOne(() => User)
  assignedTo: User;

  @ManyToOne(() => User)
  createdBy: User;

  @OneToMany(() => ProductionRecord, (record) => record.productionOrder)
  productionRecords: ProductionRecord[];

  @OneToMany(() => ProductionOrderItem, (item) => item.productionOrder, {
    cascade: true,
    eager: true,
  })
  items: ProductionOrderItem[];

  @Column({ type: 'text', nullable: true })
  notes: string;
}
