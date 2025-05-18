import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCount, StockCountItem } from '../../entities/stock-count.entity';
import { StockItem } from '../../entities/stock-item.entity';
import { StockTransaction } from '../../entities/stock-transaction.entity';
import { StockCountStatus, StockTransactionType } from '../types/stock.types';
import { StockService } from './stock.service';

interface CreateStockCountDto {
  name: string;
  countDate: Date;
  notes?: string;
  createdById: string;
}

interface StockCountItemDto {
  stockItemId: string;
  expectedQuantity: number;
  actualQuantity?: number;
  notes?: string;
}

@Injectable()
export class StockCountService {
  constructor(
    @InjectRepository(StockCount)
    private stockCountRepository: Repository<StockCount>,
    @InjectRepository(StockCountItem)
    private stockCountItemRepository: Repository<StockCountItem>,
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockTransaction)
    private stockTransactionRepository: Repository<StockTransaction>,
    private stockService: StockService
  ) {}

  /**
   * Create a new stock count
   */
  async createStockCount(createDto: CreateStockCountDto) {
    const stockCount = this.stockCountRepository.create({
      countDate: createDto.countDate,
      notes: createDto.notes ?? '',
      status: StockCountStatus.DRAFT,
      createdBy: { id: createDto.createdById },
    });

    return this.stockCountRepository.save(stockCount);
  }

  /**
   * Add items to a stock count
   */
  async addItemsToStockCount(stockCountId: string, items: StockCountItemDto[]) {
    const stockCount = await this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });

    if (!stockCount) {
      throw new Error(`Stock count with ID ${stockCountId} not found`);
    }

    if (stockCount.status !== StockCountStatus.DRAFT) {
      throw new Error('Cannot add items to a stock count that is not in draft status');
    }

    const stockCountItems = items.map((item) =>
      this.stockCountItemRepository.create({
        stockCountId,
        stockItem: { id: item.stockItemId },
        expectedQuantity: item.expectedQuantity,
        actualQuantity: item.actualQuantity,
        notes: item.notes ?? '',
      })
    );

    return this.stockCountItemRepository.save(stockCountItems);
  }

  /**
   * Start a stock count
   */
  async startStockCount(stockCountId: string) {
    const stockCount = await this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });

    if (!stockCount) {
      throw new Error(`Stock count with ID ${stockCountId} not found`);
    }

    if (stockCount.status !== StockCountStatus.DRAFT) {
      throw new Error('Cannot start a stock count that is not in draft status');
    }

    // Update all expected quantities to current stock levels
    const stockItems = await this.stockItemRepository.find();

    const stockCountItems = stockItems.map((stockItem) =>
      this.stockCountItemRepository.create({
        stockCount: { id: stockCountId },
        stockItem: { id: stockItem.id },
        expectedQuantity: stockItem.currentQuantity,
      })
    );

    await this.stockCountItemRepository.save(stockCountItems);

    // Update stock count status
    await this.stockCountRepository.update(stockCountId, {
      status: StockCountStatus.IN_PROGRESS,
    });

    return this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });
  }

  /**
   * Record actual quantities for a stock count
   */
  async recordActualQuantities(
    stockCountId: string,
    items: { stockItemId: string; actualQuantity: number; notes?: string }[]
  ) {
    const stockCount = await this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });

    if (!stockCount) {
      throw new Error(`Stock count with ID ${stockCountId} not found`);
    }

    if (stockCount.status !== StockCountStatus.IN_PROGRESS) {
      throw new Error('Cannot record quantities for a stock count that is not in progress');
    }

    for (const item of items) {
      const stockCountItem = await this.stockCountItemRepository.findOne({
        where: {
          stockCount: { id: stockCountId },
          stockItem: { id: item.stockItemId },
        },
      });

      if (stockCountItem) {
        stockCountItem.actualQuantity = item.actualQuantity;
        stockCountItem.notes = item.notes ?? '';
        stockCountItem.discrepancy = item.actualQuantity - stockCountItem.expectedQuantity;

        await this.stockCountItemRepository.save(stockCountItem);
      }
    }

    return this.getStockCountItems(stockCountId);
  }

  /**
   * Complete a stock count
   */
  async completeStockCount(stockCountId: string) {
    const stockCount = await this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });

    if (!stockCount) {
      throw new Error(`Stock count with ID ${stockCountId} not found`);
    }

    if (stockCount.status !== StockCountStatus.IN_PROGRESS) {
      throw new Error('Cannot complete a stock count that is not in progress');
    }

    // Check if all items have actual quantities
    const items = await this.stockCountItemRepository.find({
      where: { stockCountId },
    });

    const incompleteItems = items.filter((item) => item.actualQuantity === null);

    if (incompleteItems.length > 0) {
      throw new Error('Cannot complete stock count with incomplete items');
    }

    // Update stock count status
    await this.stockCountRepository.update(stockCountId, {
      status: StockCountStatus.COMPLETED,
    });

    return this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });
  }

  /**
   * Reconcile a stock count
   */
  async reconcileStockCount(stockCountId: string, userId: string) {
    const stockCount = await this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });

    if (!stockCount) {
      throw new Error(`Stock count with ID ${stockCountId} not found`);
    }

    if (stockCount.status !== StockCountStatus.COMPLETED) {
      throw new Error('Cannot reconcile a stock count that is not completed');
    }

    // Get all items with discrepancies
    const items = await this.stockCountItemRepository.find({
      where: { stockCount: { id: stockCountId } },
      relations: ['stockItem'],
    });

    const itemsWithDiscrepancies = items.filter((item) => item.discrepancy !== 0);

    // Create adjustment transactions for each discrepancy
    for (const item of itemsWithDiscrepancies) {
      // Create adjustment transaction
      const transaction = this.stockTransactionRepository.create({
        stockItemId: item.stockItem.id,
        type: StockTransactionType.ADJUSTMENT,
        quantity: Math.abs(item.discrepancy),
        unitPrice: item.stockItem.costPrice,
        reference: `Stock count reconciliation: ${stockCount.notes ?? ''}`,
        notes: `Adjustment from stock count: ${item.discrepancy > 0 ? 'Surplus' : 'Shortage'}`,
        relatedEntityId: stockCountId,
        relatedEntityType: 'StockCount',
        performedById: userId,
      });

      await this.stockTransactionRepository.save(transaction);

      // Update stock item level
      await this.stockService.updateStockLevels(
        item.stockItem.id,
        item.discrepancy,
        StockTransactionType.ADJUSTMENT
      );

      // Mark item as reconciled
      await this.stockCountItemRepository.update(
        { stockCount: { id: stockCountId }, stockItem: { id: item.stockItem.id } },
        { isReconciled: true }
      );
    }

    // Update stock count status
    await this.stockCountRepository.update(stockCountId, {
      status: StockCountStatus.RECONCILED,
      isReconciled: true,
      reconciledAt: new Date(),
      reconciledBy: { id: userId },
    });

    return this.stockCountRepository.findOne({
      where: { id: stockCountId },
    });
  }

  /**
   * Get all stock counts
   */
  async getAllStockCounts() {
    return this.stockCountRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get stock count by ID
   */
  async getStockCountById(id: string) {
    return this.stockCountRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get items for a stock count
   */
  async getStockCountItems(stockCountId: string) {
    return this.stockCountItemRepository.find({
      where: { stockCount: { id: stockCountId } },
      relations: ['stockItem'],
    });
  }
}
