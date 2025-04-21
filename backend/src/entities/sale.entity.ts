import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { SaleItem } from './sale-item.entity';

export enum SaleType {
  DIRECT = 'direct',
  COMMERCIAL = 'commercial',
}

export enum SaleStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sales')
export class Sale extends BaseEntity {
  @Column('enum', { enum: SaleType })
  type: SaleType;

  @Column('enum', { enum: SaleStatus, default: SaleStatus.DRAFT })
  status: SaleStatus;

  @ManyToOne(() => User)
  customer: User;

  @ManyToOne(() => User)
  commercialAgent: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  invoiceNumber: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
