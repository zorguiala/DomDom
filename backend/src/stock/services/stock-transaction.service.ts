import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransaction } from '../../entities/stock-transaction.entity';
import { StockItem } from '../../entities/stock-item.entity';
import { StockService } from './stock.service';
import { StockTransactionType } from '../types/stock.types';

interface CreateStockTransactionDto {
  stockItemId: string;
  type: StockTransactionType;
  quantity: number;
  unitPrice: number;
  reference?: string;
  notes?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdById: string;
}

@Injectable()
export class StockTransactionService {
  constructor(
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>,
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    private stockService: StockService
  ) {}

  /**
   * Create a new stock transaction and update stock levels
   */
  async createTransaction(createDto: CreateStockTransactionDto) {
    // Create the transaction with correct property mapping
    const transaction = this.stockTransactionRepository.create({
      stockItemId: createDto.stockItemId,
      type: createDto.type,
      quantity: createDto.quantity,
      unitPrice: createDto.unitPrice,
      reference: createDto.reference,
      notes: createDto.notes,
      relatedEntityId: createDto.relatedEntityId,
      relatedEntityType: createDto.relatedEntityType,
    });

    // Save the transaction
    const savedTransaction = await this.stockTransactionRepository.save(transaction);

    // Update stock levels
    await this.stockService.updateStockLevels(
      createDto.stockItemId,
      createDto.quantity,
      createDto.type
    );

    // Update stock item metrics
    await this.stockService.updateStockItemMetrics(createDto.stockItemId);

    // If it's a purchase, update the last purchase price
    if (createDto.type === StockTransactionType.PURCHASE) {
      await this.stockItemRepository.update(createDto.stockItemId, {
        lastPurchasePrice: createDto.unitPrice,
      });

      // Update average cost price
      await this.updateAverageCostPrice(createDto.stockItemId);
    }

    return savedTransaction;
  }

  /**
   * Create multiple transactions in bulk
   */
  async createBulkTransactions(createDtos: CreateStockTransactionDto[]) {
    const results: StockTransaction[] = [];

    for (const dto of createDtos) {
      const result = await this.createTransaction(dto);
      // Add the transaction to our results array
      results.push(result);
    }

    return results;
  }

  /**
   * Get all transactions with optional filtering
   */
  async getTransactions(filters?: {
    stockItemId?: string;
    type?: StockTransactionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = this.stockTransactionRepository.createQueryBuilder('transaction');

    if (filters?.stockItemId) {
      query = query.andWhere('transaction.stockItemId = :stockItemId', {
        stockItemId: filters.stockItemId,
      });
    }

    if (filters?.type) {
      query = query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters?.startDate && filters?.endDate) {
      query = query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    return this.stockTransactionRepository.findOne({ where: { id } });
  }

  /**
   * Update average cost price for a stock item based on its transactions
   */
  async updateAverageCostPrice(stockItemId: string) {
    // Get all purchase transactions
    const purchases = await this.stockTransactionRepository.find({
      where: {
        stockItemId,
        type: StockTransactionType.PURCHASE,
      },
    });

    if (!purchases.length) return;

    // Calculate weighted average
    let totalCost = 0;
    let totalQuantity = 0;

    for (const purchase of purchases) {
      totalCost += purchase.quantity * purchase.unitPrice;
      totalQuantity += purchase.quantity;
    }

    const averageCost = totalCost / totalQuantity;

    // Update the stock item with the new average cost
    await this.stockItemRepository.update(stockItemId, {
      averageCostPrice: averageCost,
    });
  }
}
