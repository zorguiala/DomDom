/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { BOMService } from '../../bom/bom.service';
import { BOM } from '../../entities/bom.entity';
import { ProductionRecord } from '../../entities/production-record.entity';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  FilterProductionOrdersDto,
} from '../dto/production-order.dto';
import { RecordsByEmployee } from 'src/types/production.types';
import { NotificationService } from './notification.service';
import { format } from 'date-fns';

/**
 * Service responsible for managing production orders
 */
@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private readonly productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BOM)
    private readonly bomRepository: Repository<BOM>,
    @InjectRepository(ProductionRecord)
    private readonly productionRecordRepository: Repository<ProductionRecord>,
    private readonly notificationService: NotificationService,
    private bomService: BOMService,
    private dataSource: DataSource
  ) {}

  async updateStatus(id: string, dto: UpdateProductionOrderStatusDto): Promise<ProductionOrder> {
    // Find the order
    const order = await this.findOne(id);
    if (!order) {
      throw new Error('Production order not found');
    }

    // Update the status
    order.status = dto.status;
    order.updatedAt = new Date();

    // If changing to IN_PROGRESS and no actualStartDate is set, set it to now
    if (dto.status === ProductionOrderStatus.IN_PROGRESS && !order.actualStartDate) {
      order.actualStartDate = new Date();
    }

    // If changing to COMPLETED and no completedDate is set, set it to now
    if (dto.status === ProductionOrderStatus.COMPLETED && !order.completedDate) {
      order.completedDate = new Date();

      // Send notification when order is completed
      try {
        await this.notificationService.notifyProductionOrderCompleted(id);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    // Save and return the updated order
    return this.productionOrderRepository.save(order);
  }

  /**
   * Create a new production order
   */
  async createProductionOrder(dto: CreateProductionOrderDto, user: User): Promise<ProductionOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

  /**
   * Find all production orders with filtering and pagination
   */
  async findAll(
    filterDto: FilterProductionOrdersDto
  ): Promise<{ data: ProductionOrder[]; total: number; page: number; limit: number }> {
    const {
      status,
      priority,
      bomId,
      employeeId,
      startDate,
      endDate,
      search,
      isBatchProductionOnly,
      page = 1,
      limit = 10,
    } = filterDto;

    const queryBuilder = this.productionOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.bom', 'bom')
      .leftJoinAndSelect('po.assignedTo', 'assignedTo')
      .leftJoinAndSelect('po.createdBy', 'createdBy');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('po.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('po.priority = :priority', { priority });
    }

    if (bomId) {
      queryBuilder.andWhere('bom.id = :bomId', { bomId });
    }

    if (employeeId) {
      queryBuilder.andWhere('assignedTo.id = :employeeId', { employeeId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('po.plannedStartDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('po.plannedStartDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('po.plannedStartDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      queryBuilder.andWhere('bom.name ILIKE :search', { search: `%${search}%` });
    }

    if (isBatchProductionOnly) {
      queryBuilder.andWhere('po.isBatchProduction = true');
    }

    // Count total before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .orderBy('po.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const productionOrders = await queryBuilder.getMany();

    return {
      data: productionOrders,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single production order by ID
   */
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

  /**
   * Update a production order
   */
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
    if (dto.plannedStartDate) order.plannedStartDate = new Date(dto.plannedStartDate);
    if (dto.priority) order.priority = dto.priority;
    if (dto.assignedToId) order.assignedTo = { id: dto.assignedToId } as User;
    if (dto.notes) order.notes = dto.notes;

    return this.productionOrderRepository.save(order);
  }

  /**
   * Delete a production order
   */
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

  /**
   * Get detailed progress for a production order
   */
  async getProductionOrderProgress(id: string): Promise<{
    order: ProductionOrder;
    totalCompletedQuantity: number;
    percentComplete: number;
    recordsByEmployee: RecordsByEmployee[];
  }> {
    const order = await this.findOne(id);

    const records = await this.dataSource
      .getRepository('production_record')
      .createQueryBuilder('record')
      .where('record.productionOrderId = :id', { id })
      .leftJoinAndSelect('record.employee', 'employee')
      .orderBy('record.createdAt', 'ASC')
      .getMany();

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

  /**
   * Generate a batch number for a production record
   */
  async generateBatchNumber(productionOrderId: string, batchIndex: number): Promise<string> {
    const productionOrder = await this.findOne(productionOrderId);

    if (!productionOrder.isBatchProduction) {
      throw new Error('This production order is not configured for batch production');
    }

    const prefix =
      productionOrder.batchPrefix || productionOrder.bom.name.substring(0, 3).toUpperCase();
    const datePart = format(new Date(), 'yyyyMMdd');

    return `${prefix}-${datePart}-${batchIndex + 1}`;
  }

  /**
   * Get a batch status summary
   */
  async getBatchStatus(productionOrderId: string): Promise<{
    batchCount: number;
    completedBatches: number;
    inProgressBatches: number;
    remainingBatches: number;
    nextBatchNumber: string | null;
    batches: { batchNumber: string; quantity: number; status: string; qualityChecked: boolean }[];
  }> {
    const productionOrder = await this.findOne(productionOrderId);

    if (!productionOrder.isBatchProduction) {
      throw new Error('This production order is not configured for batch production');
    }

    // Get all production records for this order
    const records = await this.productionRecordRepository.find({
      where: { productionOrder: { id: productionOrderId } },
      order: { createdAt: 'ASC' },
    });

    // Group records by batch number
    const batchMap = new Map<
      string,
      { quantity: number; status: string; qualityChecked: boolean }
    >();

    for (const record of records) {
      if (record.batchNumber) {
        const existingBatch = batchMap.get(record.batchNumber);

        if (existingBatch) {
          existingBatch.quantity += record.quantity;
          existingBatch.qualityChecked = existingBatch.qualityChecked || record.qualityChecked;
        } else {
          batchMap.set(record.batchNumber, {
            quantity: record.quantity,
            status: 'completed',
            qualityChecked: record.qualityChecked,
          });
        }
      }
    }

    const completedBatches = batchMap.size;
    const totalBatches =
      productionOrder.batchCount ||
      Math.ceil(productionOrder.quantity / (productionOrder.batchSize || 1));
    const remainingBatches = Math.max(0, totalBatches - completedBatches);

    // Generate the next batch number if not all batches are completed
    const nextBatchNumber =
      remainingBatches > 0
        ? await this.generateBatchNumber(productionOrderId, completedBatches)
        : null;

    // Convert map to array for response
    const batches = Array.from(batchMap.entries()).map(([batchNumber, data]) => ({
      batchNumber,
      ...data,
    }));

    return {
      batchCount: totalBatches,
      completedBatches,
      inProgressBatches: 0, // We don't track in-progress batches yet
      remainingBatches,
      nextBatchNumber,
      batches,
    };
  }
}
