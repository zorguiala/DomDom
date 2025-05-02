import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { ProductionRecord } from '../../entities/production-record.entity';
import { ProductionOrder, ProductionOrderStatus } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { RecordProductionOutputDto } from '../dto/production-order.dto';
import { ProductionOrderService } from './production-order.service';
import { MaterialConsumptionService } from './material-consumption.service';
import { EfficiencyMetrics, ProductionOutput } from '../../types/production.types';
import { GetProductionReportDto } from '../dto/production-report.dto';
import { ProductionReportDto, ProductionReportItemDto } from '../../types/productionReport.dto';

/**
 * Service responsible for managing production records
 */
@Injectable()
export class ProductionRecordService {
  constructor(
    @InjectRepository(ProductionRecord)
    private productionRecordRepository: Repository<ProductionRecord>,
    private productionOrderService: ProductionOrderService,
    private materialConsumptionService: MaterialConsumptionService,
    private dataSource: DataSource
  ) {}

  /**
   * Record production output for a production order
   */
  async recordProduction(
    orderId: string,
    dto: RecordProductionOutputDto,
    user: User
  ): Promise<ProductionOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.productionOrderService.findOne(orderId);

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
        qualityChecked: false,
      });

      await queryRunner.manager.save(productionRecord);

      // Update completed quantity on the order
      order.completedQuantity += dto.quantity;
      await queryRunner.manager.save(order);

      // Add items to inventory as finished products
      await this.materialConsumptionService.addFinishedProductToInventory(
        order,
        dto.quantity,
        user
      );

      // Auto-complete the order if target quantity reached
      if (order.completedQuantity >= order.quantity) {
        order.status = ProductionOrderStatus.COMPLETED;
        order.completedDate = new Date();
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();
      return this.productionOrderService.findOne(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get production records with optional filters
   */
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

  /**
   * Get production output metrics for the current day
   */
  async getProductionOutput(): Promise<ProductionOutput> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const records = await this.productionRecordRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['productionOrder', 'productionOrder.bom'],
    });

    const outputByProduct = records.reduce<Record<string, number>>((acc, record) => {
      const productName = record.productionOrder?.bom?.name || 'Unknown Product';
      acc[productName] = (acc[productName] || 0) + record.quantity;
      return acc;
    }, {});

    return {
      date: today,
      outputs: Object.entries(outputByProduct).map(([product, quantity]) => ({
        product,
        quantity,
      })),
      totalOutput: records.reduce((sum, record) => sum + record.quantity, 0),
    };
  }

  /**
   * Get efficiency metrics for the current day
   */
  async getEfficiencyMetrics(): Promise<EfficiencyMetrics> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const records = await this.productionRecordRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['productionOrder'],
    });

    const totalOutput = records.reduce((sum, record) => sum + record.quantity, 0);
    const plannedOutput = 0;
    const efficiency = plannedOutput > 0 ? (totalOutput / plannedOutput) * 100 : 0;

    return {
      date: today,
      totalOutput,
      plannedOutput: 0,
      efficiency: Math.round(efficiency * 100) / 100,
      unitsMissing: Math.max(0, plannedOutput - totalOutput),
    };
  }

  /**
   * Get production statistics for a given date range (MVP: daily total output and efficiency)
   */
  async getProductionStatistics(startDate: Date, endDate: Date): Promise<ProductionOutput[]> {
    // Ensure startDate is at 00:00:00 and endDate is at 23:59:59
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Query all records in the range
    const records = await this.productionRecordRepository.find({
      where: { createdAt: Between(start, end) },
      relations: ['productionOrder', 'productionOrder.bom'],
    });

    // Group by day
    const statsMap: Record<
      string,
      { date: Date; outputs: { product: string; quantity: number }[]; totalOutput: number }
    > = {};
    for (const record of records) {
      const day = record.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      const product = record.productionOrder?.bom?.name || 'Unknown Product';
      if (!statsMap[day]) {
        statsMap[day] = { date: new Date(day), outputs: [], totalOutput: 0 };
      }
      // Add or update product output
      const prodIdx = statsMap[day].outputs.findIndex((o) => o.product === product);
      if (prodIdx === -1) {
        statsMap[day].outputs.push({ product, quantity: record.quantity });
      } else {
        statsMap[day].outputs[prodIdx].quantity += record.quantity;
      }
      statsMap[day].totalOutput += record.quantity;
    }

    // Return sorted by date ascending
    return Object.values(statsMap).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Generate a production report for a given date range, BOM, or employee
   */
  async getProductionReport(query: GetProductionReportDto): Promise<ProductionReportDto> {
    const qb = this.productionRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.productionOrder', 'order')
      .leftJoinAndSelect('order.bom', 'bom')
      .leftJoinAndSelect('record.employee', 'employee');

    if (query.startDate) {
      qb.andWhere('record.createdAt >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('record.createdAt <= :endDate', { endDate: query.endDate });
    }
    if (query.employeeId) {
      qb.andWhere('employee.id = :employeeId', { employeeId: query.employeeId });
    }
    if (query.bomId) {
      qb.andWhere('bom.id = :bomId', { bomId: query.bomId });
    }

    const records = await qb.getMany();

    const items: ProductionReportItemDto[] = records.map((record) => ({
      orderId: record.productionOrder?.id || '',
      bomName: record.productionOrder?.bom?.name || '',
      employeeName: record.employee?.firstName || '',
      quantity: record.quantity,
      date: record.createdAt,
    }));

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, totalQuantity };
  }
}
