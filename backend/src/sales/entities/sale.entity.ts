import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { User } from '../../users/entities/user.entity';
import { SaleType, SaleStatus, PaymentMethod } from '../../types/sale.types';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: SaleType, default: SaleType.DIRECT })
  type: SaleType;

  @Column({ nullable: true })
  agentId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'timestamp' })
  saleDate: Date;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, {
    cascade: true,
    eager: true,
  })
  items: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
