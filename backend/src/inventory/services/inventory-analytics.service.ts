import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, LessThanOrEqual } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { InventoryTransaction, TransactionType } from '../../entities/inventory-transaction.entity';
import {
  StockReportItem,
  InventoryValuation,
  ProductMovementReport,
  DailyMovement,
  ProductTurnoverData,
} from '../types/inventory.types';

@Injectable()
export class InventoryAnalyticsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepository: Repository<InventoryTransaction>
  ) {}

  async getStockReport(startDate: Date, endDate: Date): Promise<StockReportItem[]> {
    return this.transactionRepository
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
      .addSelect('product.currentStock * COALESCE(product.lastPurchasePrice, 0)', 'totalValue')
      .setParameter('purchaseType', TransactionType.PURCHASE)
      .where('product.isActive = :isActive', { isActive: true })
      .getRawMany();
  }

  async getProductMovement(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProductMovementReport> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    const transactions = await this.transactionRepository.find({
      where: {
        product: { id: productId },
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const previousTransactions = await this.transactionRepository.find({
      where: {
        product: { id: productId },
        createdAt: LessThan(startDate),
      },
    });

    const openingStock = previousTransactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    const closingStock =
      openingStock + transactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    const transactionsByType = this.groupTransactionsByType(transactions);
    const totalsByType = Object.entries(transactionsByType).reduce(
      (acc, [type, txs]) => {
        acc[type] = txs.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      product,
      period: { startDate, endDate },
      openingStock,
      closingStock,
      totalsByType,
      transactions,
      dailyMovement: this.calculateDailyMovement(transactions, openingStock),
    };
  }

  async getStockTurnoverRate(startDate: Date, endDate: Date): Promise<ProductTurnoverData[]> {
    const products = await this.productRepository.find({ where: { isActive: true } });
    const results: ProductTurnoverData[] = [];

    for (const product of products) {
      const transactions = await this.transactionRepository.find({
        where: {
          product: { id: product.id },
          createdAt: Between(startDate, endDate),
          type: TransactionType.SALE_OUT,
        },
      });

      const unitsSold = transactions.reduce((sum, tx) => sum + Math.abs(tx.quantity || 0), 0);
      const averageInventory = await this.calculateAverageInventory(product.id, startDate, endDate);
      const turnoverRate = averageInventory > 0 ? unitsSold / averageInventory : 0;

      results.push({
        product,
        unitsSold,
        averageInventory,
        turnoverRate,
      });
    }

    return results;
  }

  private groupTransactionsByType(
    transactions: InventoryTransaction[]
  ): Record<string, InventoryTransaction[]> {
    return transactions.reduce(
      (acc, tx) => {
        const type = tx.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(tx);
        return acc;
      },
      {} as Record<string, InventoryTransaction[]>
    );
  }

  private calculateDailyMovement(
    transactions: InventoryTransaction[],
    initialBalance: number
  ): DailyMovement[] {
    const dailyMovements: DailyMovement[] = [];
    let currentBalance = initialBalance;

    const transactionsByDate = transactions.reduce(
      (acc, tx) => {
        const date = tx.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { in: 0, out: 0 };
        }
        if (tx.quantity > 0) {
          acc[date].in += tx.quantity;
        } else {
          acc[date].out += Math.abs(tx.quantity);
        }
        return acc;
      },
      {} as Record<string, { in: number; out: number }>
    );

    Object.entries(transactionsByDate).forEach(([date, movements]) => {
      const openingBalance = currentBalance;
      currentBalance = openingBalance + movements.in - movements.out;

      dailyMovements.push({
        date,
        openingBalance,
        in: movements.in,
        out: movements.out,
        closingBalance: currentBalance,
      });
    });

    return dailyMovements;
  }

  private async calculateAverageInventory(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const dailyStocks = await this.getDailyStocks(productId, startDate, endDate);
    return dailyStocks.length > 0
      ? dailyStocks.reduce((sum, stock) => sum + stock, 0) / dailyStocks.length
      : 0;
  }

  private async getDailyStocks(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number[]> {
    const transactions = await this.transactionRepository.find({
      where: {
        product: { id: productId },
        createdAt: LessThanOrEqual(endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const dailyStocks: number[] = [];
    let currentStock = 0;

    for (const tx of transactions) {
      if (tx.createdAt >= startDate) {
        dailyStocks.push(currentStock);
      }
      currentStock += tx.quantity;
    }

    return dailyStocks;
  }
}
