import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';

@Entity('employee_attendance')
export class EmployeeAttendance extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.attendanceRecords)
  employee: Employee;

  @Column({ type: 'timestamp' })
  clockIn: Date;

  @Column({ type: 'timestamp', nullable: true })
  clockOut: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
