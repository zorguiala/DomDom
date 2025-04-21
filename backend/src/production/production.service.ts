import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
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
        recordedBy: user,
        notes: dto.notes,
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
}
