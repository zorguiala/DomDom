import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';
import { BOM } from './bom.entity';
import { ProductionOrder } from './production-order.entity';

@Entity('production_records')
export class ProductionRecord extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.productionRecords)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => BOM)
  @JoinColumn({ name: 'bom_id' })
  bom: BOM;

  @ManyToOne(() => ProductionOrder, (order) => order.productionRecords)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  wastage: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  qualityChecked: boolean;

  @Column({ type: 'text', nullable: true })
  qualityNotes: string;
}
