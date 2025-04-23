import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { Employee } from '../entities/employee.entity';
import { User } from '../entities/user.entity';
import { BOMService } from '../bom/bom.service';
import { InventoryService } from '../inventory/inventory.service';
import { TransactionType } from '../entities/inventory-transaction.entity';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionOutputDto,
} from './dto/production-order.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(ProductionRecord)
    private productionRecordRepository: Repository<ProductionRecord>,
    private bomService: BOMService,
    private inventoryService: InventoryService,
    private dataSource: DataSource
  ) {}

  async createProductionOrder(dto: CreateProductionOrderDto, user: User): Promise<ProductionOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate BOM exists
      const bom = await this.bomService.findOne(dto.bomId);

      // Check material availability
      const availability = await this.bomService.checkAvailability(dto.bomId, dto.quantity);

      if (!availability.isAvailable) {
        throw new BadRequestException('Insufficient materials for production', {
          cause: availability.shortages,
        });
      }

      // Create production order
      const productionOrder = this.productionOrderRepository.create({
        bom: { id: dto.bomId },
        quantity: dto.quantity,
        plannedStartDate: dto.plannedStartDate,
        priority: dto.priority,
        createdBy: user,
        assignedTo: dto.assignedToId ? ({ id: dto.assignedToId } as User) : undefined,
        notes: dto.notes,
      });

      await queryRunner.manager.save(productionOrder);
      await queryRunner.commitTransaction();

      return this.findOne(productionOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(status?: ProductionOrderStatus): Promise<ProductionOrder[]> {
    const query = this.productionOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.bom', 'bom')
      .leftJoinAndSelect('order.assignedTo', 'assignedTo')
      .leftJoinAndSelect('order.createdBy', 'createdBy');

    if (status) {
      query.where('order.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<ProductionOrder> {
    const order = await this.productionOrderRepository.findOne({
      where: { id },
      relations: [
        'bom',
        'bom.items',
        'bom.items.product',
        'assignedTo',
        'createdBy',
        'productionRecords',
        'productionRecords.employee',
      ],
    });

    if (!order) {
      throw new NotFoundException('Production order not found');
    }

    return order;
  }

  async update(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const order = await this.findOne(id);

    // Can only update orders that are in planned status
    if (order.status !== ProductionOrderStatus.PLANNED) {
      throw new BadRequestException(
        'Cannot update a production order that is already in progress or completed'
      );
    }

    // If quantity is updated, check material availability
    if (dto.quantity && dto.quantity !== order.quantity) {
      const availability = await this.bomService.checkAvailability(order.bom.id, dto.quantity);

      if (!availability.isAvailable) {
        throw new BadRequestException('Insufficient materials for production', {
          cause: availability.shortages,
        });
      }
    }

    // Update the order
    if (dto.quantity) order.quantity = dto.quantity;
    if (dto.plannedStartDate) order.plannedStartDate = dto.plannedStartDate;
    if (dto.priority) order.priority = dto.priority;
    if (dto.assignedToId) order.assignedTo = { id: dto.assignedToId } as User;
    if (dto.notes) order.notes = dto.notes;

    return this.productionOrderRepository.save(order);
  }

  async updateStatus(
    id: string,
    { status }: UpdateProductionOrderStatusDto,
    user: User
  ): Promise<ProductionOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id);

      // Handle status transitions
      switch (status) {
        case ProductionOrderStatus.IN_PROGRESS:
          if (order.status !== ProductionOrderStatus.PLANNED) {
            throw new BadRequestException('Order is not in planned status');
          }
          order.status = status;
          order.actualStartDate = new Date();

          // Consume materials from inventory
          await this.consumeProductionMaterials(order, user, queryRunner);
          break;

        case ProductionOrderStatus.COMPLETED:
          if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
            throw new BadRequestException('Order is not in progress');
          }

          // Verify at least some output has been recorded
          if (!order.completedQuantity || order.completedQuantity <= 0) {
            throw new BadRequestException('Cannot complete order with no recorded output');
          }

          order.status = status;
          order.completedDate = new Date();
          break;

        case ProductionOrderStatus.CANCELLED:
          if (order.status === ProductionOrderStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed order');
          }
          order.status = status;
          break;

        default:
          throw new BadRequestException('Invalid status transition');
      }

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async recordProduction(
    orderId: string,
    dto: RecordProductionOutputDto,
    user: User
  ): Promise<ProductionOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(orderId);

      // Can only record for orders that are in progress
      if (order.status !== ProductionOrderStatus.IN_PROGRESS) {
        throw new BadRequestException('Production order is not in progress');
      }

      const productionRecord = this.productionRecordRepository.create({
        productionOrder: { id: orderId },
        employee: { id: dto.employeeId },
        quantity: dto.quantity,
        notes: dto.notes,
        startTime: new Date(),
        wastage: 0,
        qualityChecked: false
      });

      await queryRunner.manager.save(productionRecord);

      // Update completed quantity on the order
      order.completedQuantity += dto.quantity;
      await queryRunner.manager.save(order);

      // Add items to inventory as finished products
      const outputProduct = order.bom.items.find((item) => !item.product.isRawMaterial);

      if (outputProduct) {
        await this.inventoryService.recordTransaction(
          outputProduct.product.id,
          TransactionType.PRODUCTION_IN,
          dto.quantity,
          outputProduct.product.price,
          user,
          `Production order ${orderId}`,
          undefined,
          queryRunner
        );
      }

      // Auto-complete the order if target quantity reached
      if (order.completedQuantity >= order.quantity) {
        order.status = ProductionOrderStatus.COMPLETED;
        order.completedDate = new Date();
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();
      return this.findOne(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const order = await this.findOne(id);

    // Can only delete planned orders
    if (order.status !== ProductionOrderStatus.PLANNED) {
      throw new BadRequestException(
        'Cannot delete a production order that is already in progress or completed'
      );
    }

    await this.productionOrderRepository.remove(order);
  }

  private async consumeProductionMaterials(
    order: ProductionOrder,
    user: User,
    queryRunner: any
  ): Promise<void> {
    // Calculate material requirements
    const requirements = await this.bomService.calculateMaterialRequirements(
      order.bom.id,
      order.quantity
    );

    // Consume each material from inventory
    for (const requirement of requirements) {
      await this.inventoryService.recordTransaction(
        requirement.product.id,
        TransactionType.PRODUCTION_OUT,
        -requirement.requiredQuantity,
        requirement.product.price,
        user,
        `Production order ${order.id}`,
        queryRunner
      );
    }
  }

  async getProductionOrderProgress(id: string): Promise<any> {
    const order = await this.findOne(id);

    const records = await this.productionRecordRepository.find({
      where: { productionOrder: { id } },
      relations: ['employee'],
      order: { createdAt: 'ASC' },
    });

    const totalCompletedQuantity = records.reduce(
      (sum, record) => sum + Number(record.quantity),
      0
    );

    const percentComplete = (totalCompletedQuantity / Number(order.quantity)) * 100;

    const recordsByEmployee = records.reduce((acc, record) => {
      const employeeId = record.employee.id;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: record.employee,
          totalQuantity: 0,
          records: [],
        };
      }

      acc[employeeId].totalQuantity += Number(record.quantity);
      acc[employeeId].records.push(record);

      return acc;
    }, {});

    return {
      order,
      totalCompletedQuantity,
      percentComplete,
      recordsByEmployee: Object.values(recordsByEmployee),
    };
  }

  // Employee production metrics methods
  async getProductionRecords(filters: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    bomId?: string;
  }): Promise<ProductionRecord[]> {
    const query = this.productionRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.productionOrder', 'order')
      .leftJoinAndSelect('record.employee', 'employee')
      .leftJoinAndSelect('order.bom', 'bom');

    if (filters.startDate) {
      query.andWhere('record.createdAt >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      query.andWhere('record.createdAt <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    if (filters.employeeId) {
      query.andWhere('employee.id = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.bomId) {
      query.andWhere('bom.id = :bomId', { bomId: filters.bomId });
    }

    return query.getMany();
  }

  async calculateEmployeeProductivity(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    productivity: number;
    efficiency: number;
    qualityScore: number;
    totalProduced: number;
    targetProduction: number;
    attendanceRate: number;
    metrics: any;
  }> {
    // Get all production records for the employee within date range
    const records = await this.productionRecordRepository.find({
      where: {
        employee: { id: employeeId },
        createdAt: Between(startDate, endDate),
      },
      relations: ['productionOrder', 'productionOrder.bom'],
    });

    // Get attendance records for the same period
    const attendances = await this.dataSource
      .getRepository('employee_attendance')
      .createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', { employeeId })
      .andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    // Get the employee
    const employee = await this.dataSource
      .getRepository(Employee)
      .findOne({ where: { id: employeeId } });

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
    const dailyStats = this.calculateDailyProductionStats(records, attendances);

    // Update employee metrics
    employee.productivityRate = productivityRate;
    employee.qualityScore = qualityScore;
    employee.efficiencyScore = efficiencyScore;
    employee.totalProductionCount = totalProduced;
    employee.totalQualityIssues = qualityIssues;
    employee.daysAbsent = workingDays - daysWorked;

    await this.dataSource.getRepository(Employee).save(employee);

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

  async getEmployeeProductionEfficiency(date: Date = new Date()): Promise<any[]> {
    // Get the first day of the current month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get employees with production metrics
    const employees = await this.dataSource
      .getRepository(Employee)
      .createQueryBuilder('employee')
      .where('employee.isActive = :isActive', { isActive: true })
      .andWhere('employee.role = :role', { role: 'worker' })
      .getMany();

    interface EmployeeEfficiencyResult {
      employee: {
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
      };
      metrics: {
        productivity: number;
        efficiency: number;
        qualityScore: number;
        totalProduced: number;
        targetProduction: number;
        attendanceRate: number;
        metrics: any;
      };
    }

    const results: EmployeeEfficiencyResult[] = [];

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

  async getEmployeeProductionReport(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Get employee
    const employee = await this.dataSource.getRepository(Employee).findOne({
      where: { id: employeeId },
      relations: ['attendances', 'productionRecords', 'productionRecords.productionOrder'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Calculate productivity metrics
    const metrics = await this.calculateEmployeeProductivity(employeeId, startDate, endDate);

    // Get detailed production records
    const records = await this.getProductionRecords({
      employeeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Group by product/BOM
    const productionByProduct = records.reduce((acc, record) => {
      const bomId = record.productionOrder?.bom?.id;
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

  private calculateDailyProductionStats(records: ProductionRecord[], attendances: any[]): any[] {
    const dailyMap = new Map<
      string,
      {
        date: string;
        quantity: number;
        quality: number;
        attended: boolean;
      }
    >();

    // Group records by date
    records.forEach((record) => {
      const date = record.createdAt.toISOString().split('T')[0];
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
      const date = new Date(att.date).toISOString().split('T')[0];
      if (dailyMap.has(date)) {
        const current = dailyMap.get(date);
        if (current) {
          current.attended = att.status === 'present';
          dailyMap.set(date, current);
        }
      } else {
        dailyMap.set(date, {
          date,
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

  private differenceInDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

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
