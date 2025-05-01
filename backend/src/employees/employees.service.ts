import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { EmployeeAttendanceSummary } from '../types/employee.types';
import { CreateEmployeeDto, MarkAttendanceDto } from './dto/employee.dto';
import { getTodayAttendance } from './services/attendance.service';
import { createEmployee, markAttendance } from './services/employee-creation.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(EmployeeAttendance)
    private employeeAttendanceRepository: Repository<EmployeeAttendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
  ) {}

  async getTodayAttendance(): Promise<EmployeeAttendanceSummary> {
    return getTodayAttendance(this.employeeAttendanceRepository, this.employeeRepository);
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return createEmployee(this.employeeRepository, dto);
  }

  async markAttendance(dto: MarkAttendanceDto): Promise<EmployeeAttendance> {
    return markAttendance(this.employeeRepository, this.employeeAttendanceRepository, dto);
  }
}
