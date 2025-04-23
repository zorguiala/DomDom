import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { SaleItem } from './sale-item.entity';
import { Employee } from './employee.entity';

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

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
}

@Entity('sales')
export class Sale extends BaseEntity {
  @Column('enum', { enum: SaleType })
  type: SaleType;

  @Column('enum', { enum: SaleStatus, default: SaleStatus.DRAFT })
  status: SaleStatus;

  @ManyToOne(() => User)
  customer: User;

  @ManyToOne(() => Employee, { nullable: true })
  commercialAgent: Employee;

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

  @Column('enum', { enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
