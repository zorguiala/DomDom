import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EmployeeAttendance } from './employee-attendance.entity';
import { ProductionRecord } from './production-record.entity';

export enum EmployeeRole {
  WORKER = 'worker',
  SUPERVISOR = 'supervisor',
  SALESPERSON = 'salesperson',
  ADMIN = 'admin',
}

@Entity('employees')
export class Employee extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  position: string;

  @Column()
  hireDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => EmployeeAttendance, (attendance) => attendance.employee)
  attendanceRecords: EmployeeAttendance[];

  @OneToMany(() => ProductionRecord, (record) => record.employee)
  productionRecords: ProductionRecord[];

  @Column({ unique: true })
  employeeId: string;

  @Column({ nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.WORKER,
  })
  role: EmployeeRole;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  monthlySalary: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  dailyRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  // Production metrics
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  productivityRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  qualityScore: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  efficiencyScore: number;

  @Column({ type: 'int', default: 0 })
  totalProductionCount: number;

  @Column({ type: 'int', default: 0 })
  totalQualityIssues: number;

  @Column({ default: false })
  isCommissionBased: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ default: 0 })
  daysAbsent: number;

  @Column({ default: 0 })
  daysLate: number;
}
