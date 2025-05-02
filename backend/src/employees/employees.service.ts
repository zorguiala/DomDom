import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { EmployeeAttendanceSummary } from '../types/employee.types';
import { CreateEmployeeDto, MarkAttendanceDto } from './dto/employee.dto';
import { AttendanceService } from './services/attendance.service';
import { EmployeeCreationService } from './services/employee-creation.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(EmployeeAttendance)
    private employeeAttendanceRepository: Repository<EmployeeAttendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private attendanceService: AttendanceService,
    private employeeCreationService: EmployeeCreationService
  ) {}

  async getTodayAttendance(): Promise<EmployeeAttendanceSummary> {
    const raw = await this.attendanceService.getTodayAttendance();
    // Map to EmployeeAttendanceSummary type
    return {
      date: new Date(),
      totalEmployees: raw.total,
      presentCount: raw.present,
      absentCount: raw.absent,
      attendanceRate: raw.total > 0 ? raw.present / raw.total : 0,
      attendance: (raw.records || []).map(
        (rec: {
          employee?: { employeeId: string; firstName: string; lastName: string };
          clockIn: Date;
          clockOut?: Date;
        }) => ({
          employeeId: rec.employee?.employeeId || '',
          employeeName: rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : '',
          checkInTime: rec.clockIn,
          checkOutTime: rec.clockOut || null,
        })
      ),
    };
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeCreationService.createEmployee(dto);
  }

  async markAttendance(dto: MarkAttendanceDto): Promise<EmployeeAttendance> {
    return this.employeeCreationService.markAttendance(dto);
  }
}
