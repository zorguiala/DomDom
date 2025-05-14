/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { StockTransaction, StockTransactionType } from '../../entities/stock-transaction.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>
  ) {}

  /**
   * Get all products with current stock information
   */
  async getAllStock() {
    return this.productRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Get products with low stock (below minimum threshold)
   */
  async getLowStockItems() {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.currentStock <= product.minimumStock')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  /**
   * Calculate total stock value based on current stock and cost prices
   */
  async calculateTotalStockValue() {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.currentStock * product.costPrice)', 'totalValue')
      .getRawOne();
    const totalValue =
      typeof result?.totalValue === 'number' ? result.totalValue : Number(result?.totalValue) || 0;
    return totalValue;
  }

  /**
   * Get most profitable products based on margin
   */
  async getMostProfitableProducts(limit = 10) {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.currentStock > 0')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('(product.price - product.costPrice) / product.costPrice', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get top selling products by quantity
   */
  async getTopSellingProducts(limit = 10, dateRange?: { startDate: Date; endDate: Date }) {
    let query = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.productId')
      .addSelect('SUM(transaction.quantity)', 'totalSold')
      .where('transaction.type = :type', { type: StockTransactionType.SALE })
      .groupBy('transaction.productId')
      .orderBy('totalSold', 'DESC')
      .limit(limit);

    if (dateRange) {
      query = query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    const topSellingIds = await query.getRawMany();

    if (topSellingIds.length === 0) {
      return [];
    }

    const productIds = Array.isArray(topSellingIds)
      ? topSellingIds.map((item: any) => item.productId)
      : [];

    return this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids: productIds })
      .getMany();
  }

  /**
   * Update product stock levels based on a transaction
   */
  async updateStockLevels(productId: string, quantity: number, type: StockTransactionType) {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    let updatedStock = product.currentStock;

    switch (type) {
      case StockTransactionType.PURCHASE:
      case StockTransactionType.PRODUCTION_IN:
      case StockTransactionType.ADJUSTMENT:
        updatedStock += quantity;
        break;
      case StockTransactionType.SALE:
      case StockTransactionType.PRODUCTION_OUT:
        updatedStock -= quantity;
        break;
    }

    // Update product stock level
    await this.productRepository.update(productId, {
      currentStock: updatedStock,
      // If you add metrics fields to Product entity, add them here
    });

    return this.productRepository.findOne({ where: { id: productId } });
  }

  /**
   * Calculate and update product metrics (profitability, stock value)
   */
  async updateProductMetrics(productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Calculate profit margin
    const profitMargin =
      product.costPrice > 0 ? ((product.price - product.costPrice) / product.costPrice) * 100 : 0;

    // Calculate total value in stock
    const totalValueInStock = product.currentStock * product.costPrice;

    // Update product metrics
    // If you add metrics fields to Product entity, add them here
    await this.productRepository.update(productId, {
      // profitMargin,
      // totalValueInStock,
    });

    return this.productRepository.findOne({ where: { id: productId } });
  }

  /**
   * Get stock movement history for a product
   */
  async getStockMovementHistory(productId: string, dateRange?: { startDate: Date; endDate: Date }) {
    let query = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.productId = :productId', { productId })
      .orderBy('transaction.createdAt', 'DESC');

    if (dateRange) {
      query = query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    return query.getMany();
  }
}
