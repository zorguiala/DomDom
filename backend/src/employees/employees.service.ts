import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(EmployeeAttendance)
    private employeeAttendanceRepository: Repository<EmployeeAttendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
  ) {}

  async getTodayAttendance() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const totalEmployees = await this.employeeRepository.count();
    const attendance = await this.employeeAttendanceRepository.find({
      where: {
        checkInTime: Between(startOfDay, endOfDay),
      },
      relations: ['employee'],
    });

    return {
      date: today,
      totalEmployees,
      presentCount: attendance.length,
      absentCount: totalEmployees - attendance.length,
      attendanceRate: totalEmployees > 0 ? (attendance.length / totalEmployees) * 100 : 0,
      attendance: attendance.map((record) => ({
        employeeId: record.employee.id,
        employeeName: record.employee.name,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
      })),
    };
  }
}
