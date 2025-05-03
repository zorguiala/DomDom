import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Employee } from './employee.entity';

export enum EmployeeScheduleShift {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
}

@Entity('employee_schedules')
export class EmployeeSchedule extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.schedules)
  employee: Employee;

  @Column({
    type: 'enum',
    enum: EmployeeScheduleShift,
    default: EmployeeScheduleShift.MORNING,
  })
  shift: EmployeeScheduleShift;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
