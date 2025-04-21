import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';
import { BOM } from './bom.entity';

@Entity('production_records')
export class ProductionRecord extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.productionRecords)
  employee: Employee;

  @ManyToOne(() => BOM)
  bom: BOM;

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
