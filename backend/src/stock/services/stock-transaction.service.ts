import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransaction, StockTransactionType } from '../../entities/stock-transaction.entity';
import { Product } from '../../entities/product.entity';
import { StockService } from './stock.service';

interface CreateStockTransactionDto {
  productId: string;
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
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockService: StockService
  ) {}

  /**
   * Create a new stock transaction and update stock levels
   */
  async createTransaction(createDto: CreateStockTransactionDto) {
    // Create the transaction
    const transaction = this.stockTransactionRepository.create({
      product: { id: createDto.productId },
      type: createDto.type,
      quantity: createDto.quantity,
      unitPrice: createDto.unitPrice,
      reference: createDto.reference,
      notes: createDto.notes,
      relatedEntityId: createDto.relatedEntityId,
      relatedEntityType: createDto.relatedEntityType,
      createdBy: { id: createDto.createdById },
    });

    // Save the transaction
    const savedTransaction = await this.stockTransactionRepository.save(transaction);

    // Update stock levels
    await this.stockService.updateStockLevels(
      createDto.productId,
      createDto.quantity,
      createDto.type
    );

    // Update product metrics
    await this.stockService.updateProductMetrics(createDto.productId);

    // If it's a purchase, update the last purchase price
    if (createDto.type === StockTransactionType.PURCHASE) {
      await this.productRepository.update(createDto.productId, {
        lastPurchasePrice: createDto.unitPrice,
      });

      // Update average cost price
      await this.updateAverageCostPrice(createDto.productId);
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
      results.push(result);
    }

    return results;
  }

  /**
   * Get all transactions with optional filtering
   */
  async getTransactions(filters?: {
    productId?: string;
    type?: StockTransactionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = this.stockTransactionRepository.createQueryBuilder('transaction');

    if (filters?.productId) {
      query = query.andWhere('transaction.productId = :productId', {
        productId: filters.productId,
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
   * Update average cost price for a product based on purchase history
   */
  private async updateAverageCostPrice(productId: string) {
    // Get all purchase transactions for this product
    const purchases = await this.stockTransactionRepository.find({
      where: {
        productId,
        type: StockTransactionType.PURCHASE,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 10, // Consider last 10 purchases for average
    });

    if (purchases.length === 0) {
      return;
    }

    // Calculate weighted average cost
    let totalCost = 0;
    let totalQuantity = 0;

    for (const purchase of purchases) {
      totalCost += purchase.quantity * purchase.unitPrice;
      totalQuantity += purchase.quantity;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const averageCostPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    // Update the product's average cost price
    // await this.productRepository.update(productId, {
    //   averageCostPrice,
    // });
  }
}
