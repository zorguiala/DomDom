/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmployeeAttendance } from '../../entities/employee-attendance.entity';
import { Employee } from '../../entities/employee.entity';
import { MarkAttendanceDto } from '../dto/employee.dto';
import { startOfDay, endOfDay } from 'date-fns';
import { EmployeeAttendanceSummary, EmployeeAttendanceStats } from '../types/employee.types';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(EmployeeAttendance)
    private readonly attendanceRepository: Repository<EmployeeAttendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) {}

  async markAttendance(dto: MarkAttendanceDto): Promise<EmployeeAttendance> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employee: { id: employee.id },
        clockIn: Between(startOfDay(new Date()), endOfDay(new Date())),
      },
    });

    if (existingAttendance) {
      if (dto.checkOutTime) {
        existingAttendance.clockOut = dto.checkOutTime;
        existingAttendance.notes = dto.notes || existingAttendance.notes;

        const duration =
          (dto.checkOutTime.getTime() - existingAttendance.clockIn.getTime()) / (1000 * 60 * 60);
        existingAttendance.durationHours = Number(duration.toFixed(2));

        return this.attendanceRepository.save(existingAttendance);
      }
      throw new BadRequestException('Attendance already marked for today');
    }

    const attendance = this.attendanceRepository.create({
      employee,
      clockIn: dto.checkInTime,
      clockOut: dto.checkOutTime,
      notes: dto.notes,
    });

    if (dto.checkOutTime) {
      const duration = (dto.checkOutTime.getTime() - dto.checkInTime.getTime()) / (1000 * 60 * 60);
      attendance.durationHours = Number(duration.toFixed(2));
    }

    return this.attendanceRepository.save(attendance);
  }

  async getAllAttendance(startDate?: Date, endDate?: Date): Promise<EmployeeAttendance[]> {
    if (startDate && endDate) {
      return this.attendanceRepository.find({
        where: {
          clockIn: Between(startOfDay(startDate), endOfDay(endDate)),
        },
        relations: ['employee'],
        order: {
          clockIn: 'DESC',
        },
      });
    }

    // If no dates provided, return records from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.attendanceRepository.find({
      where: {
        clockIn: Between(startOfDay(thirtyDaysAgo), endOfDay(new Date())),
      },
      relations: ['employee'],
      order: {
        clockIn: 'DESC',
      },
    });
  }

  async getTodayAttendance(): Promise<EmployeeAttendanceSummary> {
    const allEmployees = await this.employeeRepository.count({
      where: { isActive: true },
    });

    const todayRecords = await this.attendanceRepository.find({
      where: {
        clockIn: Between(startOfDay(new Date()), endOfDay(new Date())),
      },
      relations: ['employee'],
    });

    return {
      present: todayRecords.length,
      absent: allEmployees - todayRecords.length,
      total: allEmployees,
      records: todayRecords,
    };
  }

  async getEmployeeAttendance(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmployeeAttendance[]> {
    return this.attendanceRepository.find({
      where: {
        employee: { employeeId },
        clockIn: Between(startOfDay(startDate), endOfDay(endDate)),
      },
      order: {
        clockIn: 'DESC',
      },
    });
  }

  async getAttendanceStats(employeeId: string): Promise<EmployeeAttendanceStats> {
    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        employee: { employeeId },
        durationHours: Between(0, 24), // Only completed days
      },
    });

    const totalHours = attendanceRecords.reduce((sum, record) => sum + record.durationHours, 0);
    const presentDays = attendanceRecords.length;

    return {
      totalDays: 30, // Last 30 days
      presentDays,
      absentDays: 30 - presentDays,
      averageHoursPerDay: presentDays ? Number((totalHours / presentDays).toFixed(2)) : 0,
    };
  }
}
