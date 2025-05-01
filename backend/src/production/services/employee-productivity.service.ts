import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { ProductionRecordService } from './production-record.service';
import {
  DailyProductionStat,
  EmployeeProductivityMetrics,
  EmployeeEfficiency,
  EmployeeProductionReport,
  ProductByBom,
} from '../../types/production.types';

interface Attendance {
  date: Date | string;
  status: string;
}

interface ProductionRecord {
  createdAt: Date;
  quantity: number;
  qualityChecked: boolean;
  productionOrder?: {
    quantity: number;
    actualStartDate?: Date;
    plannedStartDate: Date;
    completedDate?: Date;
    bom?: {
      id: string;
      name: string;
    };
  };
}

/**
 * Service responsible for managing employee productivity metrics
 */
@Injectable()
export class EmployeeProductivityService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private productionRecordService: ProductionRecordService,
    private dataSource: DataSource
  ) {}

  /**
   * Calculate employee productivity metrics
   */
  async calculateEmployeeProductivity(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmployeeProductivityMetrics> {
    // Get all production records for the employee within date range
    const records = await this.productionRecordService.getProductionRecords({
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Get attendance records for the same period
    const attendances = await this.dataSource
      .getRepository('employee_attendance')
      .createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', { employeeId })
      .andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Get the employee
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Calculate productivity metrics
    let totalProduced = 0;
    let totalExpected = 0;
    let qualityIssues = 0;

    records.forEach((record) => {
      totalProduced += Number(record.quantity);

      if (record.productionOrder?.quantity) {
        // Expected units per day based on production order timeframe
        const orderDuration =
          this.differenceInDays(
            record.productionOrder.actualStartDate || record.productionOrder.plannedStartDate,
            record.productionOrder.completedDate || new Date()
          ) || 1; // At least 1 day

        const dailyExpected = Number(record.productionOrder.quantity) / orderDuration;
        totalExpected += dailyExpected;
      }

      if (!record.qualityChecked) {
        qualityIssues++;
      }
    });

    // Get working days in period
    const workingDays = this.getBusinessDaysCount(startDate, endDate);

    // Attendance rate: days worked / working days in period
    const daysWorked = attendances.filter((a) => a.status === 'present').length;
    const attendanceRate = workingDays > 0 ? daysWorked / workingDays : 0;

    // Productivity rate: actual output / (expected output * attendance rate)
    const adjustedExpected = totalExpected * attendanceRate || 1; // Avoid division by zero
    const productivityRate = totalProduced / adjustedExpected;

    // Quality score: (total - issues) / total
    const qualityScore = records.length > 0 ? (records.length - qualityIssues) / records.length : 1;

    // Efficiency: productivity * quality * attendance
    const efficiencyScore = productivityRate * qualityScore * attendanceRate;

    // Calculate daily production statistics
    const dailyStats = this.calculateDailyProductionStats(records, attendances as Attendance[]);

    // Update employee metrics
    employee.productivityRate = productivityRate;
    employee.qualityScore = qualityScore;
    employee.efficiencyScore = efficiencyScore;
    employee.totalProductionCount = totalProduced;
    employee.totalQualityIssues = qualityIssues;
    employee.daysAbsent = workingDays - daysWorked;

    await this.employeeRepository.save(employee);

    return {
      productivity: productivityRate,
      efficiency: efficiencyScore,
      qualityScore,
      totalProduced,
      targetProduction: totalExpected,
      attendanceRate,
      metrics: {
        dailyStats,
        totalRecords: records.length,
        daysWorked,
        workingDays,
        daysAbsent: workingDays - daysWorked,
      },
    };
  }

  /**
   * Get employee production efficiency for all employees
   */
  async getEmployeeProductionEfficiency(date: Date = new Date()): Promise<EmployeeEfficiency[]> {
    // Get the first day of the current month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get employees with production metrics
    const employees = await this.employeeRepository
      .createQueryBuilder('employee')
      .where('employee.isActive = :isActive', { isActive: true })
      .andWhere('employee.role = :role', { role: 'worker' })
      .getMany();

    const results: EmployeeEfficiency[] = [];

    for (const employee of employees) {
      // Calculate current month metrics
      const metrics = await this.calculateEmployeeProductivity(employee.id, startOfMonth, date);

      results.push({
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
        },
        metrics,
      });
    }

    // Sort by efficiency score (highest first)
    return results.sort((a, b) => b.metrics.efficiency - a.metrics.efficiency);
  }

  /**
   * Get detailed production report for an employee
   */
  async getEmployeeProductionReport(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmployeeProductionReport> {
    // Get employee
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['attendances'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Calculate productivity metrics
    const metrics = await this.calculateEmployeeProductivity(employeeId, startDate, endDate);

    // Get detailed production records
    const records = await this.productionRecordService.getProductionRecords({
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Group by product/BOM
    const productionByProduct = records.reduce((acc: Record<string, ProductByBom>, record) => {
      const bomId = record.productionOrder?.bom?.id || 'unknown';
      const bomName = record.productionOrder?.bom?.name || 'Unknown';

      if (!acc[bomId]) {
        acc[bomId] = {
          bomId,
          bomName,
          totalQuantity: 0,
          records: [],
        };
      }

      acc[bomId].totalQuantity += Number(record.quantity);
      acc[bomId].records.push(record);

      return acc;
    }, {});

    return {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
        role: employee.role,
      },
      metrics,
      productionByProduct: Object.values(productionByProduct),
      records,
    };
  }

  /**
   * Calculate daily production stats
   */
  private calculateDailyProductionStats(
    records: ProductionRecord[],
    attendances: Attendance[]
  ): DailyProductionStat[] {
    const dailyMap = new Map<string, DailyProductionStat>();

    // Group records by date
    records.forEach((record) => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      const current = dailyMap.get(date) || {
        date,
        quantity: 0,
        quality: 0,
        attended: false,
      };

      current.quantity += Number(record.quantity);
      if (record.qualityChecked) {
        current.quality += 1;
      }

      dailyMap.set(date, current);
    });

    // Add attendance info
    attendances.forEach((att) => {
      // Convert date to string if it's a Date object
      const dateStr =
        att.date instanceof Date
          ? att.date.toISOString().split('T')[0]
          : new Date(att.date).toISOString().split('T')[0];

      if (dailyMap.has(dateStr)) {
        const current = dailyMap.get(dateStr);
        if (current) {
          current.attended = att.status === 'present';
          dailyMap.set(dateStr, current);
        }
      } else {
        dailyMap.set(dateStr, {
          date: dateStr,
          quantity: 0,
          quality: 0,
          attended: att.status === 'present',
        });
      }
    });

    return Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Calculate difference in days between two dates
   */
  private differenceInDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get count of business days between two dates
   */
  private getBusinessDaysCount(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }
}
