import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { InventoryTransaction, TransactionType } from '../entities/inventory-transaction.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { BatchInventoryDto } from './dto/batch-inventory.dto';
import { BarcodeScanDto } from './dto/barcode-scan.dto';
import { StockReportItem, InventoryValuation } from './types/inventory.types';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async recordTransaction(
    productId: string,
    type: TransactionType,
    quantity: number,
    unitPrice: number,
    user: User,
    reference?: string,
    notes?: string,
    queryRunner?: QueryRunner
  ): Promise<InventoryTransaction> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const transaction = this.inventoryTransactionRepository.create({
      product,
      type,
      quantity,
      unitPrice,
      reference,
      notes,
      createdBy: user,
    });

    // Update product stock based on transaction type
    switch (type) {
      case TransactionType.PURCHASE:
      case TransactionType.PRODUCTION_IN:
        product.currentStock = (product.currentStock || 0) + quantity;
        break;
      case TransactionType.SALE_OUT:
      case TransactionType.PRODUCTION_OUT:
        if ((product.currentStock || 0) < quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
        product.currentStock = (product.currentStock || 0) - quantity;
        break;
      case TransactionType.ADJUSTMENT:
        product.currentStock = quantity; // Direct stock adjustment
        break;
    }

    if (queryRunner) {
      await queryRunner.manager.save(product);
      return queryRunner.manager.save(transaction);
    }

    await this.productRepository.save(product);
    return this.inventoryTransactionRepository.save(transaction);
  }

  async getTransactionHistory(
    productId?: string,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryTransaction[]> {
    const query = this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy');

    if (productId) {
      query.andWhere('product.id = :productId', { productId });
    }

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    return query.getMany();
  }

  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (threshold !== undefined) {
      query.andWhere('product.currentStock <= :threshold', { threshold });
    } else {
      query.andWhere(
        '(product.minimumStock > 0 AND product.currentStock <= product.minimumStock) OR ' +
          '(product.minimumStock = 0 AND product.currentStock <= 5)'
      );
    }

    return query.getMany();
  }

  async getStockReport(startDate: Date, endDate: Date): Promise<StockReportItem[]> {
    return this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect(
        'SUM(CASE WHEN transaction.type = :purchaseType THEN transaction.quantity ELSE 0 END)',
        'totalPurchased'
      )
      .addSelect(
        'SUM(CASE WHEN transaction.type = :saleType THEN transaction.quantity ELSE 0 END)',
        'totalSold'
      )
      .addSelect('product.currentStock', 'currentStock')
      .leftJoin('transaction.product', 'product')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .setParameter('purchaseType', TransactionType.PURCHASE)
      .setParameter('saleType', TransactionType.SALE_OUT)
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.currentStock')
      .getRawMany();
  }

  async processBarcodeScan(barcodeScanDto: BarcodeScanDto, user: User): Promise<InventoryTransaction> {
    const product = await this.productRepository.findOne({
      where: { barcode: barcodeScanDto.barcode },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcodeScanDto.barcode} not found`);
    }

    return this.recordTransaction(
      product.id,
      barcodeScanDto.type,
      barcodeScanDto.quantity,
      barcodeScanDto.unitPrice || product.lastPurchasePrice || 0,
      user,
      barcodeScanDto.reference,
      barcodeScanDto.notes
    );
  }

  async processBatchTransactions(batchDto: BatchInventoryDto, user: User): Promise<InventoryTransaction[]> {
    const transactions: InventoryTransaction[] = [];

    for (const item of batchDto.items) {
      try {
        const transaction = await this.recordTransaction(
          item.productId,
          item.type,
          item.quantity,
          item.unitPrice,
          user,
          item.reference,
          item.notes
        );
        transactions.push(transaction);
      } catch (error) {
        // Log the error but continue processing other items
        console.error(`Error processing batch item: ${error.message}`);
      }
    }

    return transactions;
  }

  async getInventoryValuation(): Promise<InventoryValuation[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.currentStock', 'currentStock')
      .addSelect('product.lastPurchasePrice', 'lastPurchasePrice')
      .addSelect(
        '(SELECT AVG(unitPrice) FROM inventory_transactions WHERE product_id = product.id AND type = :purchaseType)',
        'averageCost'
      )
      .addSelect(
        'product.currentStock * COALESCE(product.lastPurchasePrice, 0)',
        'totalValue'
      )
      .setParameter('purchaseType', TransactionType.PURCHASE)
      .where('product.isActive = :isActive', { isActive: true })
      .getRawMany();
  }

  async getStockAdjustmentHistory(
    productId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryTransaction[]> {
    const query = this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy')
      .where('transaction.type = :type', { type: TransactionType.ADJUSTMENT });

    if (productId) {
      query.andWhere('product.id = :productId', { productId });
    }

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    return query.getMany();
  }

  async getLowStockAlerts(threshold?: number): Promise<{
    products: Product[];
    totalValue: number;
    criticalItems: Product[];
  }> {
    const lowStockProducts = await this.getLowStockProducts(threshold);
    const criticalItems = lowStockProducts.filter(
      (product) => product.currentStock <= (product.minimumStock || 0) / 2
    );

    const totalValue = lowStockProducts.reduce(
      (sum, product) => sum + (product.currentStock * (product.lastPurchasePrice || 0)),
      0
    );

    return {
      products: lowStockProducts,
      totalValue,
      criticalItems,
    };
  }
}
