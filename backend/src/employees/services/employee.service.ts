import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeSchedule } from '../../entities/employee-schedule.entity';
import { ProductionRecord } from '../../entities/production-record.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateScheduleDto,
  UpdateScheduleDto,
} from '../dto/employee.dto';
import { EmployeeProductivityMetrics } from '../types/employee.types';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeSchedule)
    private readonly scheduleRepository: Repository<EmployeeSchedule>,
    @InjectRepository(ProductionRecord)
    private readonly productionRecordRepository: Repository<ProductionRecord>
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { email: createEmployeeDto.email } as FindOptionsWhere<Employee>,
        { employeeId: createEmployeeDto.employeeId } as FindOptionsWhere<Employee>,
      ],
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email or ID already exists');
    }

    // First create the employee entity
    const employee = this.employeeRepository.create();

    // Then assign the properties
    Object.assign(employee, {
      ...createEmployeeDto,
      attendanceRecords: [],
      productionRecords: [],
    });

    return await this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['attendanceRecords', 'productionRecords'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with employee ID ${employeeId} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Apply updates to the existing entity
    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    await this.employeeRepository.save(employee);
  }

  async updateProductivityMetrics(
    id: string,
    metrics: EmployeeProductivityMetrics
  ): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, metrics);
    return await this.employeeRepository.save(employee);
  }

  async getProductivityMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<EmployeeProductivityMetrics[]> {
    const employees = await this.employeeRepository.find({
      where: { isActive: true },
    });

    // If dates provided, calculate metrics for that period for each employee
    if (startDate && endDate) {
      const result: EmployeeProductivityMetrics[] = [];
      for (const employee of employees) {
        const metrics = await this.calculateProductivityForPeriod(
          employee,
          new Date(startDate),
          new Date(endDate)
        );

        result.push({
          id: employee.id,
          employeeId: employee.id,
          period: `${startDate}/${endDate}`,
          ...metrics,
        });
      }
      return result;
    }

    // Otherwise return current metrics for all employees
    return employees.map((employee) => ({
      id: employee.id,
      employeeId: employee.id,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      productivityRate: employee.productivityRate,
      qualityScore: employee.qualityScore,
      efficiencyScore: employee.efficiencyScore,
      totalProductionCount: employee.totalProductionCount,
      totalQualityIssues: employee.totalQualityIssues,
    }));
  }

  async getEmployeeProductivity(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<EmployeeProductivityMetrics> {
    const employee = await this.findOne(id);

    // If dates provided, calculate metrics for that period
    if (startDate && endDate) {
      const records = await this.calculateProductivityForPeriod(
        employee,
        new Date(startDate),
        new Date(endDate)
      );
      return {
        id: employee.id,
        employeeId: employee.id,
        period: `${startDate}/${endDate}`,
        ...records,
      };
    }

    // Otherwise return current metrics
    return {
      id: employee.id,
      employeeId: employee.id,
      period: new Date().toISOString().slice(0, 7),
      productivityRate: employee.productivityRate,
      qualityScore: employee.qualityScore,
      efficiencyScore: employee.efficiencyScore,
      totalProductionCount: employee.totalProductionCount,
      totalQualityIssues: employee.totalQualityIssues,
    };
  }

  private async calculateProductivityForPeriod(
    employee: Employee,
    startDate: Date,
    endDate: Date
  ): Promise<Omit<EmployeeProductivityMetrics, 'employeeId' | 'period' | 'id'>> {
    const records = await this.productionRecordRepository.find({
      where: {
        employee: { id: employee.id },
        createdAt: Between(startDate, endDate),
      },
    });

    const totalProduction = records.reduce((sum, record) => sum + record.quantity, 0);
    const qualityIssues = records.filter((record) => !record.qualityChecked).length;

    return {
      productivityRate: totalProduction / records.length || 0,
      qualityScore: ((records.length - qualityIssues) / records.length) * 100 || 0,
      efficiencyScore: (totalProduction / (records.length * 8)) * 100 || 0, // assuming 8-hour shifts
      totalProductionCount: totalProduction,
      totalQualityIssues: qualityIssues,
    };
  }

  async getEmployeeSchedules(
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<EmployeeSchedule[]> {
    // Find the employee first to validate it exists
    const employee = await this.findOne(employeeId);

    // Build query conditions
    const where: FindOptionsWhere<EmployeeSchedule> = {
      employee: { id: employee.id },
    };

    // Add date range if provided
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    return this.scheduleRepository.find({
      where,
      order: {
        date: 'ASC',
      },
    });
  }

  async getSchedules(startDate?: string, endDate?: string): Promise<EmployeeSchedule[]> {
    const where: FindOptionsWhere<EmployeeSchedule> = {};
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    return this.scheduleRepository.find({
      where,
      relations: ['employee'],
    });
  }

  async createSchedule(id: string, schedule: CreateScheduleDto): Promise<EmployeeSchedule> {
    const employee = await this.findOne(id);

    // Check for existing schedule on the same date
    const existingSchedule = await this.scheduleRepository.findOne({
      where: {
        employee: { id },
        date: schedule.date,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException('Employee already has a schedule for this date');
    }

    const newSchedule = this.scheduleRepository.create({
      ...schedule,
      employee,
    });

    return this.scheduleRepository.save(newSchedule);
  }

  async updateSchedule(
    id: string,
    scheduleId: string,
    schedule: UpdateScheduleDto
  ): Promise<EmployeeSchedule> {
    await this.findOne(id); // Validate employee exists
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, employee: { id } },
    });

    if (!existingSchedule) {
      throw new NotFoundException('Schedule not found');
    }

    Object.assign(existingSchedule, schedule);
    return this.scheduleRepository.save(existingSchedule);
  }

  async deleteSchedule(id: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, employee: { id } },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleRepository.remove(schedule);
  }
}
