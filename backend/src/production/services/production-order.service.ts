/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../../entities/production-order.entity';
import { User } from '../../entities/user.entity';
import { BOMService } from '../../bom/bom.service';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  GetProductionOrdersDto,
} from '../dto/production-order.dto';
import { RecordsByEmployee } from 'src/types/production.types';

/**
 * Service responsible for managing production orders
 */
@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
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
   * Find all production orders, optionally filtering by status
   */
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

  /**
   * Advanced filtering, pagination, and sorting for production orders
   */
  async findAllWithFilters(
    query: GetProductionOrdersDto
  ): Promise<{ data: ProductionOrder[]; total: number; page: number; limit: number }> {
    const qb = this.productionOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.bom', 'bom')
      .leftJoinAndSelect('order.assignedTo', 'assignedTo')
      .leftJoinAndSelect('order.createdBy', 'createdBy');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    if (query.employeeId) {
      qb.andWhere('assignedTo.id = :employeeId', { employeeId: query.employeeId });
    }
    if (query.bomId) {
      qb.andWhere('bom.id = :bomId', { bomId: query.bomId });
    }
    if (query.startDate) {
      qb.andWhere('order.plannedStartDate >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('order.plannedStartDate <= :endDate', { endDate: query.endDate });
    }

    // Sorting
    if (query.sortBy) {
      qb.orderBy(`order.${query.sortBy}`, query.sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else {
      qb.orderBy('order.createdAt', 'DESC');
    }

    // Pagination
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * Find a production order by id including related entities
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
    if (dto.plannedStartDate) order.plannedStartDate = dto.plannedStartDate;
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
}
