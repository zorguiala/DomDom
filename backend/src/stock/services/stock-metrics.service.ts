import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from '../../entities/stock-item.entity';
import { StockTransaction } from '../../entities/stock-transaction.entity';
import { StockItemType, StockTransactionType, StockMetricsResponse } from '../types/stock.types';

/**
 * Service for generating stock metrics and analytics
 */
@Injectable()
export class StockMetricsService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>,
  ) {}

  /**
   * Get comprehensive stock metrics
   */
  async getStockMetrics(): Promise<StockMetricsResponse> {
    const allStockItems = await this.stockItemRepository.find();
    const lowStockItems = allStockItems.filter(
      item => item.minimumQuantity > 0 && item.currentQuantity <= item.minimumQuantity
    );

    // Calculate total stock value
    const totalStockValue = allStockItems.reduce(
      (sum, item) => sum + (item.currentQuantity * item.costPrice),
      0
    );

    // Get most profitable products
    const mostProfitableProducts = await this.getMostProfitableProducts(5);
    
    // Get low stock items
    const lowestStockItems = await this.getLowestStockItems(5);
    
    // Get top selling products
    const topSellingProducts = await this.getTopSellingProducts(5);

    return {
      totalStockValue,
      totalStockItems: allStockItems.length,
      lowStockItemsCount: lowStockItems.length,
      mostProfitableProducts,
      lowestStockItems,
      topSellingProducts
    };
  }

  /**
   * Get most profitable products based on profit margin
   */
  async getMostProfitableProducts(limit: number = 5) {
    const stockItems = await this.stockItemRepository.find({
      where: {
        type: StockItemType.FINISHED,
      }
    });

    return stockItems
      .filter(item => item.sellingPrice > 0)
      .map(item => ({
        ...item,
        profitMargin: ((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100,
        totalProfit: item.sellingPrice - item.costPrice,
        stockValue: item.currentQuantity * item.costPrice
      }))
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, limit);
  }

  /**
   * Get items with lowest stock relative to their minimum quantities
   */
  async getLowestStockItems(limit: number = 5) {
    // Get all stock items - we'll filter for those with minimumQuantity > 0
    const stockItems = await this.stockItemRepository.find();

    return stockItems
      .filter(item => item.minimumQuantity > 0)
      .map(item => ({
        ...item,
        stockValue: item.currentQuantity * item.costPrice,
        // Calculate days until stockout based on average daily usage (if we have data)
        daysUntilStockout: 0 // To be implemented with usage data
      }))
      .sort((a, b) => {
        // Sort by ratio of current to minimum (lower ratio = higher priority)
        const ratioA = a.currentQuantity / a.minimumQuantity;
        const ratioB = b.currentQuantity / b.minimumQuantity;
        return ratioA - ratioB;
      })
      .slice(0, limit);
  }

  /**
   * Get top selling products based on sales transactions
   */
  async getTopSellingProducts(limit: number = 5, period?: { start: Date; end: Date }) {
    // First get all finished products
    const finishedProducts = await this.stockItemRepository.find({
      where: { 
        type: StockItemType.FINISHED 
      }
    });

    // For each product, calculate total sales
    const productSales = await Promise.all(
      finishedProducts.map(async product => {
        // Get all SALE transactions for this product
        let query = this.stockTransactionRepository.createQueryBuilder('transaction')
          .where('transaction.stockItemId = :stockItemId', { stockItemId: product.id })
          .andWhere('transaction.type = :type', { type: StockTransactionType.SALE });

        // Add date filtering if provided
        if (period) {
          query = query.andWhere('transaction.createdAt BETWEEN :start AND :end', {
            start: period.start,
            end: period.end
          });
        }

        const salesTransactions = await query.getMany();

        // Calculate total sales quantity
        const salesCount = salesTransactions.reduce(
          (sum, transaction) => sum + transaction.quantity,
          0
        );

        return {
          ...product,
          salesCount,
          profitMargin: product.sellingPrice ? 
            ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 : 0,
          stockValue: product.currentQuantity * product.costPrice
        };
      })
    );

    // Sort by sales count and return top products
    return productSales
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  }
}
