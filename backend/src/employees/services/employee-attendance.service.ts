import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AttendanceStatus } from '@prisma/client';

@Injectable()
export class EmployeeAttendanceService {
  private readonly logger = new Logger(EmployeeAttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record employee check-in
   */
  async recordCheckIn(employeeId: string, data: {
    date?: Date;
    status?: AttendanceStatus;
    notes?: string;
  }) {
    const { date = new Date(), status = AttendanceStatus.PRESENT, notes } = data;

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if there's already an attendance record for this employee and date
    const existingRecord = await this.prisma.employeeAttendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingRecord) {
      if (existingRecord.checkIn) {
        throw new BadRequestException('Employee has already checked in today');
      }

      // Update existing record with check-in time
      return this.prisma.employeeAttendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: new Date(),
          status,
          notes,
        },
        include: { employee: true },
      });
    }

    // Create new attendance record
    return this.prisma.employeeAttendance.create({
      data: {
        employee: { connect: { id: employeeId } },
        date,
        checkIn: new Date(),
        status,
        notes,
      },
      include: { employee: true },
    });
  }

  /**
   * Record employee check-out
   */
  async recordCheckOut(employeeId: string, data: {
    date?: Date;
    notes?: string;
  }) {
    const { date = new Date(), notes } = data;

    // Find today's attendance record
    const attendanceRecord = await this.prisma.employeeAttendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (!attendanceRecord) {
      throw new NotFoundException(`No attendance record found for employee ${employeeId} today`);
    }

    if (attendanceRecord.checkOut) {
      throw new BadRequestException('Employee has already checked out today');
    }

    // Update attendance record with check-out time
    return this.prisma.employeeAttendance.update({
      where: { id: attendanceRecord.id },
      data: {
        checkOut: new Date(),
        notes: notes ? `${attendanceRecord.notes || ''} ${notes}`.trim() : attendanceRecord.notes,
      },
      include: { employee: true },
    });
  }

  /**
   * Manually create or update attendance record
   */
  async createOrUpdateAttendance(data: {
    employeeId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: AttendanceStatus;
    notes?: string;
  }) {
    const { employeeId, date, checkIn, checkOut, status, notes } = data;

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Format date to start of day
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // Check if there's already an attendance record for this employee and date
    const existingRecord = await this.prisma.employeeAttendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(formattedDate.setHours(0, 0, 0, 0)),
          lt: new Date(formattedDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingRecord) {
      // Update existing record
      return this.prisma.employeeAttendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn,
          checkOut,
          status,
          notes,
        },
        include: { employee: true },
      });
    }

    // Create new attendance record
    return this.prisma.employeeAttendance.create({
      data: {
        employee: { connect: { id: employeeId } },
        date: formattedDate,
        checkIn,
        checkOut,
        status,
        notes,
      },
      include: { employee: true },
    });
  }

  /**
   * Get attendance records for an employee
   */
  async getEmployeeAttendance(employeeId: string, params: {
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    skip?: number;
    take?: number;
  }) {
    const { startDate, endDate, status, skip, take } = params;

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Build where clause
    const where: Prisma.EmployeeAttendanceWhereInput = {
      employeeId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (status) {
      where.status = status;
    }

    // Get attendance records
    const [records, count] = await Promise.all([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { employee: true },
      }),
      this.prisma.employeeAttendance.count({ where }),
    ]);

    return {
      records,
      count,
      skip: skip || 0,
      take: take || count,
    };
  }

  /**
   * Get all attendance records
   */
  async getAllAttendance(params: {
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    skip?: number;
    take?: number;
  }) {
    const { date, startDate, endDate, status, skip, take } = params;

    // Build where clause
    const where: Prisma.EmployeeAttendanceWhereInput = {};

    if (date) {
      // Get records for a specific date
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (status) {
      where.status = status;
    }

    // Get attendance records
    const [records, count] = await Promise.all([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: { employee: true },
      }),
      this.prisma.employeeAttendance.count({ where }),
    ]);

    return {
      records,
      count,
      skip: skip || 0,
      take: take || count,
    };
  }

  /**
   * Delete an attendance record
   */
  async deleteAttendance(id: string) {
    try {
      return await this.prisma.employeeAttendance.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Attendance record with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Calculate monthly attendance summary for an employee
   */
  async getMonthlyAttendanceSummary(employeeId: string, year: number, month: number) {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Get all attendance records for the month
    const attendanceRecords = await this.prisma.employeeAttendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate summary statistics
    const presentDays = attendanceRecords.filter(record => record.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendanceRecords.filter(record => record.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendanceRecords.filter(record => record.status === AttendanceStatus.LATE).length;
    const halfDays = attendanceRecords.filter(record => record.status === AttendanceStatus.HALF_DAY).length;
    const leaveDays = attendanceRecords.filter(record => record.status === AttendanceStatus.ON_LEAVE).length;

    // Calculate working days in the month (excluding weekends)
    const workingDays = this.getWorkingDaysInMonth(year, month);

    // Calculate unrecorded days (working days without attendance records)
    const recordedDays = attendanceRecords.length;
    const unrecordedDays = workingDays - recordedDays;

    return {
      employee,
      year,
      month,
      startDate,
      endDate,
      workingDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      leaveDays,
      recordedDays,
      unrecordedDays,
      attendancePercentage: workingDays > 0 ? (presentDays / workingDays) * 100 : 0,
      records: attendanceRecords,
    };
  }

  /**
   * Calculate salary based on attendance
   */
  async calculateSalary(employeeId: string, year: number, month: number) {
    // Get employee with salary information
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (!employee.salary) {
      throw new BadRequestException(`Employee ${employee.name} does not have a base salary defined`);
    }

    // Get monthly attendance summary
    const attendanceSummary = await this.getMonthlyAttendanceSummary(employeeId, year, month);
    
    // Calculate base salary (proportional to days worked)
    const baseSalary = Number(employee.salary);
    
    // Calculate deductions for absences and half days
    const deductionPerDay = baseSalary / attendanceSummary.workingDays;
    const absentDeduction = attendanceSummary.absentDays * deductionPerDay;
    const halfDayDeduction = (attendanceSummary.halfDays * deductionPerDay) / 2;
    const lateDeduction = (attendanceSummary.lateDays * deductionPerDay) * 0.25; // 25% deduction for late days
    
    // Calculate total deductions
    const totalDeductions = absentDeduction + halfDayDeduction + lateDeduction;
    
    // Calculate net salary
    const netSalary = baseSalary - totalDeductions;

    return {
      employee,
      year,
      month,
      baseSalary,
      workingDays: attendanceSummary.workingDays,
      presentDays: attendanceSummary.presentDays,
      absentDays: attendanceSummary.absentDays,
      halfDays: attendanceSummary.halfDays,
      lateDays: attendanceSummary.lateDays,
      leaveDays: attendanceSummary.leaveDays,
      deductions: {
        absentDeduction,
        halfDayDeduction,
        lateDeduction,
        totalDeductions,
      },
      netSalary,
      attendanceSummary,
    };
  }

  /**
   * Generate monthly payroll for all employees
   */
  async generateMonthlyPayroll(year: number, month: number) {
    // Get all active employees
    const employees = await this.prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        salary: {
          not: null,
        },
      },
    });

    // Calculate salary for each employee
    const payrollEntries = await Promise.all(
      employees.map(async (employee) => {
        try {
          return await this.calculateSalary(employee.id, year, month);
        } catch (error) {
          this.logger.error(`Error calculating salary for employee ${employee.name}: ${error.message}`);
          return {
            employee,
            error: error.message,
          };
        }
      })
    );

    // Calculate payroll totals
    const totalBaseSalary = payrollEntries
      .filter(entry => !entry.error)
      .reduce((sum, entry) => sum + entry.baseSalary, 0);
    
    const totalDeductions = payrollEntries
      .filter(entry => !entry.error)
      .reduce((sum, entry) => sum + entry.deductions.totalDeductions, 0);
    
    const totalNetSalary = payrollEntries
      .filter(entry => !entry.error)
      .reduce((sum, entry) => sum + entry.netSalary, 0);

    return {
      year,
      month,
      employeeCount: employees.length,
      totalBaseSalary,
      totalDeductions,
      totalNetSalary,
      entries: payrollEntries,
    };
  }

  /**
   * Helper method to get working days in a month (excluding weekends)
   */
  private getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // 0 is Sunday, 6 is Saturday
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }
}
