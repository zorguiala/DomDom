import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Employee } from './employee.entity';
import { SaleType, SaleStatus, PaymentMethod } from '../types/sale.types';
import { Product } from './product.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale extends BaseEntity {
  @Column('enum', { enum: SaleType })
  type: SaleType;

  @Column('enum', { enum: SaleStatus, default: SaleStatus.PENDING })
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
