import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { ProductionRecord } from '../../entities/production-record.entity';
import { ProductionOrder, ProductionOrderStatus } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { RecordProductionOutputDto } from '../dto/production-order.dto';
import { ProductionOrderService } from './production-order.service';
import { MaterialConsumptionService } from './material-consumption.service';
import { EfficiencyMetrics, ProductionOutput } from '../../types/production.types';
import { ProductionReportDto, ProductionReportItemDto } from '../../types/productionReport.dto';
import { Employee } from '../../entities/employee.entity';
import { BOM } from '../../entities/bom.entity';
import {
  CreateProductionRecordDto,
  GetProductionRecordsFilterDto,
  UpdateProductionRecordDto,
} from '../dto/production.dto';
import { NotificationService } from './notification.service';

/**
 * Service responsible for managing production records
 */
@Injectable()
export class ProductionRecordService {
  constructor(
    @InjectRepository(ProductionRecord)
    private productionRecordRepository: Repository<ProductionRecord>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
    private notificationService: NotificationService,
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
  async getProductionReport(query: any): Promise<ProductionReportDto> {
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

  /**
   * Create a new production record
   */
  async createProductionRecord(createDto: CreateProductionRecordDto): Promise<ProductionRecord> {
    const {
      employeeId,
      bomId,
      productionOrderId,
      quantity,
      wastage,
      notes,
      qualityChecked,
      qualityNotes,
      batchNumber,
      batchExpiryDate,
      batchLocation,
    } = createDto;

    // Find related entities
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const bom = await this.bomRepository.findOne({ where: { id: bomId } });
    if (!bom) {
      throw new NotFoundException(`BOM with ID ${bomId} not found`);
    }

    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id: productionOrderId },
      relations: ['productionRecords'],
    });
    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    // Create the production record
    const productionRecord = new ProductionRecord();
    productionRecord.employee = employee;
    productionRecord.bom = bom;
    productionRecord.productionOrder = productionOrder;
    productionRecord.quantity = quantity;
    productionRecord.wastage = wastage || 0;
    productionRecord.startTime = new Date();
    productionRecord.notes = notes || '';

    // Quality control fields
    productionRecord.qualityChecked = qualityChecked || false;
    productionRecord.qualityNotes = qualityNotes || '';

    // Batch tracking fields
    if (productionOrder.isBatchProduction) {
      if (batchNumber) {
        productionRecord.batchNumber = batchNumber;
      } else {
        // Generate batch number if not provided
        const batchStatus = await this.productionOrderService.getBatchStatus(productionOrderId);
        if (batchStatus.nextBatchNumber) {
          productionRecord.batchNumber = batchStatus.nextBatchNumber;
        } else {
          productionRecord.batchNumber = '';
        }
      }

      if (batchExpiryDate) {
        productionRecord.batchExpiryDate = new Date(batchExpiryDate);
      }

      productionRecord.batchLocation = batchLocation || '';
    }

    const savedRecord = await this.productionRecordRepository.save(productionRecord);

    // Update production order completed quantity and status
    productionOrder.completedQuantity += quantity;

    // Update status to IN_PROGRESS if it's still in PLANNED status
    if (productionOrder.status === ProductionOrderStatus.PLANNED) {
      productionOrder.status = ProductionOrderStatus.IN_PROGRESS;
      productionOrder.actualStartDate = new Date();
    }

    // Update status to COMPLETED if all quantity is produced
    if (productionOrder.completedQuantity >= productionOrder.quantity) {
      productionOrder.status = ProductionOrderStatus.COMPLETED;
      productionOrder.completedDate = new Date();

      // Send notification when order is completed
      try {
        await this.notificationService.notifyProductionOrderCompleted(productionOrderId);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    await this.productionOrderRepository.save(productionOrder);

    // If this is a batch production and quality check is performed, notify
    if (productionOrder.isBatchProduction && productionRecord.batchNumber) {
      try {
        await this.notificationService.notifyBatchCompleted(
          productionOrderId,
          productionRecord.batchNumber
        );
      } catch (error) {
        console.error('Failed to send batch notification:', error);
      }

      // Send quality issue notification if issues found
      if (qualityChecked && qualityNotes && qualityNotes.toLowerCase().includes('issue')) {
        try {
          await this.notificationService.notifyQualityIssue(productionOrderId, qualityNotes);
        } catch (error) {
          console.error('Failed to send quality issue notification:', error);
        }
      }
    }

    return savedRecord;
  }

  /**
   * Update a production record
   */
  async updateProductionRecord(
    id: string,
    updateDto: UpdateProductionRecordDto
  ): Promise<ProductionRecord> {
    const productionRecord = await this.productionRecordRepository.findOne({
      where: { id },
      relations: ['productionOrder'],
    });

    if (!productionRecord) {
      throw new NotFoundException(`Production record with ID ${id} not found`);
    }

    // Calculate the quantity difference to update production order's completedQuantity
    const quantityDiff =
      updateDto.quantity !== undefined ? updateDto.quantity - productionRecord.quantity : 0;

    // Update production record fields
    if (updateDto.quantity !== undefined) {
      productionRecord.quantity = updateDto.quantity;
    }

    if (updateDto.wastage !== undefined) {
      productionRecord.wastage = updateDto.wastage;
    }

    if (updateDto.notes !== undefined) {
      productionRecord.notes = updateDto.notes || '';
    }

    // Quality control fields
    if (updateDto.qualityChecked !== undefined) {
      productionRecord.qualityChecked = updateDto.qualityChecked;
    }

    if (updateDto.qualityNotes !== undefined) {
      productionRecord.qualityNotes = updateDto.qualityNotes || '';

      // Send quality issue notification if issues found
      if (
        productionRecord.qualityChecked &&
        updateDto.qualityNotes &&
        updateDto.qualityNotes.toLowerCase().includes('issue')
      ) {
        try {
          await this.notificationService.notifyQualityIssue(
            productionRecord.productionOrder.id,
            updateDto.qualityNotes
          );
        } catch (error) {
          console.error('Failed to send quality issue notification:', error);
        }
      }
    }

    // Batch tracking fields
    if (updateDto.batchNumber !== undefined) {
      productionRecord.batchNumber = updateDto.batchNumber || '';
    }

    if (updateDto.batchExpiryDate) {
      productionRecord.batchExpiryDate = new Date(updateDto.batchExpiryDate);
    }

    if (updateDto.batchLocation !== undefined) {
      productionRecord.batchLocation = updateDto.batchLocation || '';
    }

    // Set end time if not already set
    if (!productionRecord.endTime) {
      productionRecord.endTime = new Date();
    }

    const savedRecord = await this.productionRecordRepository.save(productionRecord);

    // Update production order's completedQuantity if quantity changed
    if (quantityDiff !== 0) {
      const productionOrder = productionRecord.productionOrder;
      productionOrder.completedQuantity += quantityDiff;

      // Update status to COMPLETED if all quantity is produced
      if (
        productionOrder.completedQuantity >= productionOrder.quantity &&
        productionOrder.status !== ProductionOrderStatus.COMPLETED
      ) {
        productionOrder.status = ProductionOrderStatus.COMPLETED;
        productionOrder.completedDate = new Date();

        // Send notification when order is completed
        try {
          await this.notificationService.notifyProductionOrderCompleted(productionOrder.id);
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }

      await this.productionOrderRepository.save(productionOrder);
    }

    return savedRecord;
  }

  /**
   * Find all production records with filtering
   */
  async findAll(filterDto: GetProductionRecordsFilterDto): Promise<ProductionRecord[]> {
    const {
      startDate,
      endDate,
      employeeId,
      bomId,
      productionOrderId,
      qualityChecked,
      batchNumber,
      page,
      limit,
    } = filterDto;

    const query = this.productionRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.employee', 'employee')
      .leftJoinAndSelect('record.bom', 'bom')
      .leftJoinAndSelect('record.productionOrder', 'productionOrder')
      .orderBy('record.createdAt', 'DESC');

    if (startDate && endDate) {
      query.andWhere('record.startTime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('record.startTime >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      query.andWhere('record.startTime <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (employeeId) {
      query.andWhere('employee.id = :employeeId', { employeeId });
    }

    if (bomId) {
      query.andWhere('bom.id = :bomId', { bomId });
    }

    if (productionOrderId) {
      query.andWhere('productionOrder.id = :productionOrderId', { productionOrderId });
    }

    if (qualityChecked !== undefined) {
      query.andWhere('record.qualityChecked = :qualityChecked', { qualityChecked });
    }

    if (batchNumber) {
      query.andWhere('record.batchNumber LIKE :batchNumber', { batchNumber: `%${batchNumber}%` });
    }

    // Apply pagination if provided
    if (page && limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    return query.getMany();
  }

  /**
   * Find a production record by ID
   */
  async findOne(id: string): Promise<ProductionRecord> {
    const productionRecord = await this.productionRecordRepository.findOne({
      where: { id },
      relations: ['employee', 'bom', 'productionOrder'],
    });

    if (!productionRecord) {
      throw new NotFoundException(`Production record with ID ${id} not found`);
    }

    return productionRecord;
  }

  /**
   * Delete a production record
   */
  async remove(id: string): Promise<void> {
    const productionRecord = await this.findOne(id);
    const productionOrder = productionRecord.productionOrder;

    // Update production order's completedQuantity
    productionOrder.completedQuantity -= productionRecord.quantity;

    // Ensure completedQuantity doesn't go below 0
    if (productionOrder.completedQuantity < 0) {
      productionOrder.completedQuantity = 0;
    }

    // Update status to IN_PROGRESS if it was COMPLETED but now quantity is not met
    if (
      productionOrder.status === ProductionOrderStatus.COMPLETED &&
      productionOrder.completedQuantity < productionOrder.quantity
    ) {
      productionOrder.status = ProductionOrderStatus.IN_PROGRESS;
      // Set completedDate to a future date (workaround for null/undefined not being assignable to Date)
      productionOrder.completedDate = new Date('9999-12-31');
    }

    await this.productionOrderRepository.save(productionOrder);

    const result = await this.productionRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Production record with ID ${id} not found`);
    }
  }

  /**
   * Get records grouped by batch
   */
  async getRecordsByBatch(productionOrderId: string): Promise<
    {
      batchNumber: string;
      quantity: number;
      qualityChecked: boolean;
      records: ProductionRecord[];
    }[]
  > {
    const records = await this.productionRecordRepository.find({
      where: { productionOrder: { id: productionOrderId } },
      relations: ['employee'],
      order: { createdAt: 'ASC' },
    });

    // Group records by batch number
    const batchMap = new Map<
      string,
      {
        quantity: number;
        qualityChecked: boolean;
        records: ProductionRecord[];
      }
    >();

    for (const record of records) {
      if (record.batchNumber) {
        const existingBatch = batchMap.get(record.batchNumber);

        if (existingBatch) {
          existingBatch.quantity += record.quantity;
          existingBatch.qualityChecked = existingBatch.qualityChecked || record.qualityChecked;
          existingBatch.records.push(record);
        } else {
          batchMap.set(record.batchNumber, {
            quantity: record.quantity,
            qualityChecked: record.qualityChecked,
            records: [record],
          });
        }
      }
    }

    // Convert map to array for response
    return Array.from(batchMap.entries()).map(([batchNumber, data]) => ({
      batchNumber,
      ...data,
    }));
  }

  /**
   * Get quality control statistics
   */
  async getQualityControlStats(filterDto: GetProductionRecordsFilterDto): Promise<{
    totalRecords: number;
    qualityCheckedRecords: number;
    qualityCheckRate: number;
    issuesFound: number;
    issueRate: number;
  }> {
    const records = await this.findAll(filterDto);

    const totalRecords = records.length;
    const qualityCheckedRecords = records.filter((record) => record.qualityChecked).length;

    // Count records with quality issues
    const issuesFound = records.filter(
      (record) =>
        record.qualityChecked &&
        record.qualityNotes &&
        record.qualityNotes.toLowerCase().includes('issue')
    ).length;

    return {
      totalRecords,
      qualityCheckedRecords,
      qualityCheckRate: totalRecords > 0 ? (qualityCheckedRecords / totalRecords) * 100 : 0,
      issuesFound,
      issueRate: qualityCheckedRecords > 0 ? (issuesFound / qualityCheckedRecords) * 100 : 0,
    };
  }
}
