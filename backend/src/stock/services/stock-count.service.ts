import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCount, StockCountItem, StockCountStatus } from '../../entities/stock-count.entity';
import { Product } from '../../entities/product.entity';
import { StockTransaction, StockTransactionType } from '../../entities/stock-transaction.entity';
import { StockService } from './stock.service';

interface CreateStockCountDto {
  name: string;
  countDate: Date;
  notes?: string;
  createdById: string;
}

interface StockCountItemDto {
  productId: string;
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
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
        product: { id: item.productId },
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
    const products = await this.productRepository.find();

    const stockCountItems = products.map((product) =>
      this.stockCountItemRepository.create({
        stockCountId,
        product: { id: product.id },
        expectedQuantity: product.currentStock,
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
    items: { productId: string; actualQuantity: number; notes?: string }[]
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
          stockCountId,
          productId: item.productId,
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
      where: { stockCountId },
      relations: ['product'],
    });

    const itemsWithDiscrepancies = items.filter((item) => item.discrepancy !== 0);

    // Create adjustment transactions for each discrepancy
    for (const item of itemsWithDiscrepancies) {
      // Create adjustment transaction
      const transaction = this.stockTransactionRepository.create({
        product: { id: item.productId },
        type: StockTransactionType.ADJUSTMENT,
        quantity: Math.abs(item.discrepancy),
        unitPrice: item.product.costPrice,
        reference: `Stock count reconciliation: ${stockCount.notes ?? ''}`,
        notes: `Adjustment from stock count: ${item.discrepancy > 0 ? 'Surplus' : 'Shortage'}`,
        relatedEntityId: stockCountId,
        relatedEntityType: 'StockCount',
        createdBy: { id: userId },
      });

      await this.stockTransactionRepository.save(transaction);

      // Update product stock level
      await this.stockService.updateStockLevels(
        item.productId,
        item.discrepancy,
        StockTransactionType.ADJUSTMENT
      );

      // Mark item as reconciled
      await this.stockCountItemRepository.update(
        { stockCountId, productId: item.productId },
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
      where: { stockCountId },
      relations: ['product'],
    });
  }
}
