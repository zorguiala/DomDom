import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EmployeeAttendance } from './employee-attendance.entity';
import { ProductionRecord } from './production-record.entity';
import { EmployeeSchedule } from './employee-schedule.entity';

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

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  position: string;

  @Column({ type: 'timestamp' })
  hireDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlySalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ default: true })
  isActive: boolean;

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

  // Sales related
  @Column({ default: false })
  isCommissionBased: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionRate: number;

  // Relationships
  @OneToMany(() => EmployeeAttendance, (attendance) => attendance.employee)
  attendanceRecords: EmployeeAttendance[];

  @OneToMany(() => ProductionRecord, (record) => record.employee)
  productionRecords: ProductionRecord[];

  @OneToMany(() => EmployeeSchedule, (schedule) => schedule.employee)
  schedules: EmployeeSchedule[];
}
