import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { EmployeeAttendance } from './employee-attendance.entity';
import { ProductionRecord } from './production-record.entity';

@Entity('employees')
export class Employee extends User {
  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => EmployeeAttendance, (attendance) => attendance.employee)
  attendanceRecords: EmployeeAttendance[];

  @OneToMany(() => ProductionRecord, (record) => record.employee)
  productionRecords: ProductionRecord[];
}
