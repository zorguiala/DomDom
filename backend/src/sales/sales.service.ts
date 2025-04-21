import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleType, SaleStatus } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { TransactionType } from '../entities/inventory-transaction.entity';
import { User } from '../entities/user.entity';
import { DirectSaleDto } from './dto/direct-sale.dto';
import { AgentAssignmentDto, AgentReturnDto } from './dto/commercial-sale.dto';
import { PaymentMethod } from './enums/payment-method.enum';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    private inventoryService: InventoryService,
    private dataSource: DataSource
  ) {}

  async createDirectSale(data: DirectSaleDto, user: User): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create sale record
      const sale = this.saleRepository.create({
        type: SaleType.DIRECT,
        status: SaleStatus.COMPLETED,
        createdBy: user,
        paymentMethod: data.paymentMethod,
        customerInfo: data.customerInfo,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Process each sale item
      let totalAmount = 0;
      const saleItems = await Promise.all(
        data.items.map(async (item) => {
          const product = await this.inventoryService.findOne(item.productId);

          if (!product) {
            throw new BadRequestException(`Product ${item.productId} not found`);
          }

          if (product.currentStock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
          }

          const totalPrice = item.quantity * item.unitPrice;
          totalAmount += totalPrice;

          // Create sale item
          const saleItem = this.saleItemRepository.create({
            sale: savedSale,
            product: { id: item.productId },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice,
            finalPrice: totalPrice,
          });

          // Update inventory
          await this.inventoryService.recordTransaction(
            item.productId,
            TransactionType.SALE,
            -item.quantity,
            item.unitPrice,
            user,
            `Sale ${savedSale.id}`,
            queryRunner
          );

          return saleItem;
        })
      );

      // Save sale items
      await queryRunner.manager.save(SaleItem, saleItems);

      // Update sale totals
      savedSale.totalAmount = totalAmount;
      savedSale.finalAmount = totalAmount;
      await queryRunner.manager.save(Sale, savedSale);

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createCommercialAssignment(data: AgentAssignmentDto, user: User): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create sale record for tracking assigned products
      const sale = this.saleRepository.create({
        type: SaleType.COMMERCIAL,
        status: SaleStatus.DRAFT,
        createdBy: user,
        commercialAgent: { id: data.agentId } as User,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Process each product assignment
      const saleItems = await Promise.all(
        data.assignments.map(async (assignment) => {
          const product = await this.inventoryService.findOne(assignment.productId);

          if (!product) {
            throw new BadRequestException(`Product ${assignment.productId} not found`);
          }

          if (product.currentStock < assignment.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
          }

          // Create sale item for tracking
          const saleItem = this.saleItemRepository.create({
            sale: savedSale,
            product: { id: assignment.productId },
            quantity: assignment.quantity,
            unitPrice: product.price,
            totalPrice: 0, // Will be updated when agent returns
            finalPrice: 0,
          });

          // Update inventory - mark as assigned to agent
          await this.inventoryService.recordTransaction(
            assignment.productId,
            TransactionType.SALE,
            -assignment.quantity,
            product.price,
            user,
            `Commercial Assignment ${savedSale.id}`,
            queryRunner
          );

          return saleItem;
        })
      );

      await queryRunner.manager.save(SaleItem, saleItems);
      await queryRunner.commitTransaction();
      return savedSale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processCommercialReturn(data: AgentReturnDto, user: User): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the original assignment sale
      const originalSale = await this.saleRepository.findOne({
        where: {
          commercialAgent: { id: data.agentId },
          status: SaleStatus.DRAFT,
        },
        relations: ['items', 'items.product'],
      });

      if (!originalSale) {
        throw new BadRequestException('No active assignment found for this agent');
      }

      let totalAmount = 0;

      // Process each return
      await Promise.all(
        data.returns.map(async (returnItem) => {
          const originalItem = originalSale.items.find(
            (item) => item.product.id === returnItem.productId
          );

          if (!originalItem) {
            throw new BadRequestException(
              `Product ${returnItem.productId} was not in original assignment`
            );
          }

          if (returnItem.returnedQuantity + returnItem.soldQuantity > originalItem.quantity) {
            throw new BadRequestException(
              `Total quantity (sold + returned) exceeds assigned quantity for ${originalItem.product.name}`
            );
          }

          // Calculate sales amount
          const salesAmount = returnItem.soldQuantity * returnItem.unitPrice;
          totalAmount += salesAmount;

          // Update original sale item
          originalItem.totalPrice = salesAmount;
          originalItem.finalPrice = salesAmount;

          // Return unsold items to inventory
          if (returnItem.returnedQuantity > 0) {
            await this.inventoryService.recordTransaction(
              returnItem.productId,
              TransactionType.ADJUSTMENT,
              returnItem.returnedQuantity,
              originalItem.unitPrice,
              user,
              `Commercial Return ${originalSale.id}`,
              queryRunner
            );
          }
        })
      );

      // Update and complete the sale
      originalSale.status = SaleStatus.COMPLETED;
      originalSale.totalAmount = totalAmount;
      originalSale.finalAmount = totalAmount;
      originalSale.completedAt = new Date();

      await queryRunner.manager.save(Sale, originalSale);
      await queryRunner.commitTransaction();
      return originalSale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(startDate?: Date, endDate?: Date, userId?: string): Promise<Sale[]> {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.user', 'user');

    if (startDate && endDate) {
      query.where('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    return sale;
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    return this.saleRepository
      .createQueryBuilder('sale')
      .select('DATE(sale.saleDate)', 'date')
      .addSelect('COUNT(DISTINCT sale.id)', 'totalSales')
      .addSelect('SUM(sale.totalAmount)', 'totalAmount')
      .where('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(sale.saleDate)')
      .orderBy('date', 'DESC')
      .getRawMany();
  }

  async getTopProducts(startDate: Date, endDate: Date, limit = 10) {
    return this.saleItemRepository
      .createQueryBuilder('saleItem')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(saleItem.quantity)', 'totalQuantity')
      .addSelect('SUM(saleItem.quantity * saleItem.unitPrice)', 'totalRevenue')
      .leftJoin('saleItem.product', 'product')
      .leftJoin('saleItem.sale', 'sale')
      .where('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async generateInvoice(saleId: string): Promise<string> {
    const sale = await this.findOne(saleId);

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException('Cannot generate invoice for incomplete sale');
    }

    // TODO: Implement invoice generation logic
    // This will be implemented when we add document generation service
    return `Invoice-${sale.id}`;
  }
}
