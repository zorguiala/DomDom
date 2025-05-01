import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees.controller';
import { EmployeeService } from './services/employee.service';
import { AttendanceService } from './services/attendance.service';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeAttendance])],
  controllers: [EmployeesController],
  providers: [EmployeeService, AttendanceService],
  exports: [EmployeeService, AttendanceService],
})
export class EmployeesModule {}
