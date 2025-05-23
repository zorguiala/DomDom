/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../../entities/stock-item.entity';
import { StockTransaction } from '../../entities/stock-transaction.entity';
import { StockTransactionType } from '../types/stock.types';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>
  ) {}

  /**
   * Get all stock items with current stock information
   */
  async getAllStock() {
    return this.stockItemRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  /**
   * Get stock items with low stock (below minimum threshold)
   */
  async getLowStockItems() {
    return this.stockItemRepository
      .createQueryBuilder('stockItem')
      .where('stockItem.currentQuantity <= stockItem.minimumQuantity')
      .andWhere('stockItem.isActive = :isActive', { isActive: true })
      .getMany();
  }

  /**
   * Calculate total stock value based on current stock and cost prices
   */
  async calculateTotalStockValue() {
    const result = await this.stockItemRepository
      .createQueryBuilder('stockItem')
      .select('SUM(stockItem.currentQuantity * stockItem.costPrice)', 'totalValue')
      .getRawOne();
    const totalValue =
      typeof result?.totalValue === 'number' ? result.totalValue : Number(result?.totalValue) || 0;
    return totalValue;
  }

  /**
   * Get most profitable stock items based on margin
   */
  async getMostProfitableProducts(limit = 10) {
    return this.stockItemRepository
      .createQueryBuilder('stockItem')
      .where('stockItem.currentQuantity > 0')
      .andWhere('stockItem.isActive = :isActive', { isActive: true })
      .orderBy('(stockItem.sellingPrice - stockItem.costPrice) / stockItem.costPrice', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get top selling stock items by quantity
   */
  async getTopSellingProducts(limit = 10, dateRange?: { startDate: Date; endDate: Date }) {
    let query = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.stockItemId')
      .addSelect('SUM(transaction.quantity)', 'totalSold')
      .where('transaction.type = :type', { type: StockTransactionType.SALE })
      .groupBy('transaction.stockItemId')
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

    const stockItemIds = Array.isArray(topSellingIds)
      ? topSellingIds.map((item: any) => item.stockItemId)
      : [];

    return this.stockItemRepository
      .createQueryBuilder('stockItem')
      .where('stockItem.id IN (:...ids)', { ids: stockItemIds })
      .getMany();
  }

  /**
   * Update stock item levels based on a transaction
   */
  async updateStockLevels(stockItemId: string, quantity: number, type: StockTransactionType) {
    const stockItem = await this.stockItemRepository.findOne({ where: { id: stockItemId } });

    if (!stockItem) {
      throw new Error(`Stock item with ID ${stockItemId} not found`);
    }

    let updatedQuantity = stockItem.currentQuantity;

    switch (type) {
      case StockTransactionType.PURCHASE:
      case StockTransactionType.PRODUCTION_IN:
      case StockTransactionType.ADJUSTMENT:
        updatedQuantity += quantity;
        break;
      case StockTransactionType.SALE:
      case StockTransactionType.PRODUCTION_OUT:
        updatedQuantity -= quantity;
        break;
    }

    // Update stock item level
    await this.stockItemRepository.update(stockItemId, {
      currentQuantity: updatedQuantity,
    });

    return this.stockItemRepository.findOne({ where: { id: stockItemId } });
  }

  /**
   * Calculate and update stock item metrics (profitability, stock value)
   */
  async updateStockItemMetrics(stockItemId: string) {
    const stockItem = await this.stockItemRepository.findOne({ where: { id: stockItemId } });

    if (!stockItem) {
      throw new Error(`Stock item with ID ${stockItemId} not found`);
    }

    // Calculate profit margin
    const profitMargin =
      stockItem.costPrice > 0 ? ((stockItem.sellingPrice - stockItem.costPrice) / stockItem.costPrice) * 100 : 0;

    // Calculate total value in stock
    const totalValueInStock = stockItem.currentQuantity * stockItem.costPrice;

    // These metric fields would need to be added to the StockItem entity
    // For now we'll just log these metrics instead of updating the entity
    console.log(`Stock Item ${stockItemId} metrics:`, { profitMargin, totalValueInStock });

    return this.stockItemRepository.findOne({ where: { id: stockItemId } });
  }

  /**
   * Get stock movement history for a stock item
   */
  async getStockMovementHistory(stockItemId: string, dateRange?: { startDate: Date; endDate: Date }) {
    let query = this.stockTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.stockItemId = :stockItemId', { stockItemId })
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
