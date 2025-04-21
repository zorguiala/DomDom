import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  InventoryTransaction,
  TransactionType,
} from '../entities/inventory-transaction.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async recordTransaction(
    productId: string,
    type: TransactionType,
    quantity: number,
    unitPrice: number,
    user: User,
    reference?: string,
    notes?: string,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
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
        product.currentStock += quantity;
        break;
      case TransactionType.SALE:
      case TransactionType.PRODUCTION_OUT:
        if (product.currentStock < quantity) {
          throw new Error('Insufficient stock');
        }
        product.currentStock -= quantity;
        break;
      case TransactionType.ADJUSTMENT:
        product.currentStock = quantity; // Direct stock adjustment
        break;
    }

    await this.productRepository.save(product);
    return this.inventoryTransactionRepository.save(transaction);
  }

  async getTransactionHistory(
    productId?: string,
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ) {
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

  async getLowStockProducts(threshold?: number) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (threshold) {
      query.andWhere('product.currentStock <= :threshold', { threshold });
    } else {
      query.andWhere('product.currentStock <= product.minimumStock');
    }

    return query.getMany();
  }

  async getStockReport(startDate: Date, endDate: Date) {
    return this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect(
        'SUM(CASE WHEN type = :purchaseType THEN quantity ELSE 0 END)',
        'totalPurchased',
      )
      .addSelect(
        'SUM(CASE WHEN type = :saleType THEN quantity ELSE 0 END)',
        'totalSold',
      )
      .addSelect('product.currentStock', 'currentStock')
      .leftJoin('transaction.product', 'product')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .setParameter('purchaseType', TransactionType.PURCHASE)
      .setParameter('saleType', TransactionType.SALE)
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.currentStock')
      .getRawMany();
  }
}
