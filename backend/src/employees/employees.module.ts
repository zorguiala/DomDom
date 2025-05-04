import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeeService } from './services/employee.service';
import { AttendanceService } from './services/attendance.service';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { EmployeeSchedule } from '../entities/employee-schedule.entity';
import { ProductionRecord } from '../entities/production-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeAttendance, EmployeeSchedule, ProductionRecord]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeeService, AttendanceService],
  exports: [EmployeeService, AttendanceService],
})
export class EmployeesModule {}
