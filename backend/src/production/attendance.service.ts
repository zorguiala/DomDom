import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, Not, IsNull } from 'typeorm';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { Employee } from '../entities/employee.entity';
import { User } from '../entities/user.entity';
import { ClockInOutDto, AttendanceQueryDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(EmployeeAttendance)
    private attendanceRepository: Repository<EmployeeAttendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>
  ) {}

  async clockIn(clockInDto: ClockInOutDto, user: User): Promise<EmployeeAttendance> {
    const employee = await this.employeeRepository.findOne({
      where: { id: clockInDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee is already clocked in
    const activeAttendance = await this.attendanceRepository.findOne({
      where: {
        employee: { id: clockInDto.employeeId },
        clockOutTime: null,
      },
    });

    if (activeAttendance) {
      throw new BadRequestException('Employee is already clocked in');
    }

    const attendance = this.attendanceRepository.create({
      employee: { id: clockInDto.employeeId },
      clockInTime: new Date(),
      notes: clockInDto.notes,
      recordedBy: user,
    });

    return this.attendanceRepository.save(attendance);
  }

  async clockOut(clockOutDto: ClockInOutDto, user: User): Promise<EmployeeAttendance> {
    const employee = await this.employeeRepository.findOne({
      where: { id: clockOutDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Find active attendance record
    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee: { id: clockOutDto.employeeId },
        clockOutTime: null,
      },
    });

    if (!attendance) {
      throw new BadRequestException('No active attendance record found for employee');
    }

    // Update with clock out time
    attendance.clockOutTime = new Date();
    attendance.notes = attendance.notes
      ? `${attendance.notes}; ${clockOutDto.notes || ''}`
      : clockOutDto.notes;

    // Calculate duration in hours
    const clockIn = new Date(attendance.clockInTime);
    const clockOut = new Date(attendance.clockOutTime);
    const durationMs = clockOut.getTime() - clockIn.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    attendance.durationHours = durationHours;

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceRecords(queryDto: AttendanceQueryDto): Promise<EmployeeAttendance[]> {
    const startDate = new Date(queryDto.startDate);
    const endDate = new Date(queryDto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Set endDate to end of day
    endDate.setHours(23, 59, 59, 999);

    const query = {
      clockInTime: Between(startDate, endDate),
    };

    if (queryDto.employeeId) {
      query['employee'] = { id: queryDto.employeeId };
    }

    return this.attendanceRepository.find({
      where: query,
      relations: ['employee', 'recordedBy'],
      order: { clockInTime: 'DESC' },
    });
  }

  async getAttendanceSummary(startDate: Date, endDate: Date): Promise<any> {
    const records = await this.attendanceRepository.find({
      where: {
        clockInTime: Between(startDate, endDate),
        clockOutTime: Not(IsNull()),
      },
      relations: ['employee'],
    });

    const summary = records.reduce((acc, record) => {
      const employeeId = record.employee.id;

      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: record.employee,
          totalDays: 0,
          totalHours: 0,
          records: [],
        };
      }

      acc[employeeId].totalDays += 1;
      acc[employeeId].totalHours += Number(record.durationHours) || 0;
      acc[employeeId].records.push(record);

      return acc;
    }, {});

    return Object.values(summary);
  }
}
