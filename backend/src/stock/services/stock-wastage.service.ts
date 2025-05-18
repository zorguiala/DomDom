import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockWastage, WastageReason } from '../../entities/stock-wastage.entity';
import { StockItem } from '../../entities/stock-item.entity';
import { User } from '../../entities/user.entity';
import { StockTransactionService } from './stock-transaction.service';
import { StockTransactionType } from '../types/stock.types';

interface CreateWastageRecordDto {
  stockItemId: string;
  quantity: number;
  reason: WastageReason;
  date: Date;
  notes?: string;
}

/**
 * Service to manage stock wastage records
 * Tracks stock items that are wasted due to expiry, damage, or other reasons
 */
@Injectable()
export class StockWastageService {
  constructor(
    @InjectRepository(StockWastage)
    private wastageRepository: Repository<StockWastage>,
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    private transactionService: StockTransactionService
  ) {}

  /**
   * Create a new wastage record and deduct stock accordingly
   */
  async create(createWastageDto: CreateWastageRecordDto, user: User): Promise<StockWastage> {
    // Verify stock item exists
    const stockItem = await this.stockItemRepository.findOne({
      where: { id: createWastageDto.stockItemId },
    });

    if (!stockItem) {
      throw new NotFoundException(`Stock item with ID ${createWastageDto.stockItemId} not found`);
    }

    // Create the wastage record
    const wastage = this.wastageRepository.create({
      stockItem: { id: createWastageDto.stockItemId },
      quantity: createWastageDto.quantity,
      reason: createWastageDto.reason,
      date: createWastageDto.date,
      notes: createWastageDto.notes,
      recordedBy: { id: user.id },
    });
    
    // Save the wastage record
    const savedWastage = await this.wastageRepository.save(wastage);
    
    // Create a stock transaction to reduce the stock level
    await this.transactionService.createTransaction({
      stockItemId: createWastageDto.stockItemId,
      type: StockTransactionType.WASTE,
      quantity: -createWastageDto.quantity, // Negative quantity to reduce stock
      unitPrice: stockItem.costPrice,
      reference: `Wastage: ${createWastageDto.reason}`,
      notes: createWastageDto.notes,
      relatedEntityId: savedWastage.id,
      relatedEntityType: 'WASTAGE',
      createdById: user.id
    });
    
    return savedWastage;
  }

  /**
   * Find all wastage records with optional filtering
   */
  async findAll(filters?: {
    stockItemId?: string;
    startDate?: Date;
    endDate?: Date;
    reason?: WastageReason;
  }): Promise<StockWastage[]> {
    let queryBuilder = this.wastageRepository.createQueryBuilder('wastage')
      .leftJoinAndSelect('wastage.stockItem', 'stockItem')
      .leftJoinAndSelect('wastage.recordedBy', 'user');
    
    if (filters?.stockItemId) {
      queryBuilder = queryBuilder.andWhere('wastage.stockItemId = :stockItemId', {
        stockItemId: filters.stockItemId,
      });
    }
    
    if (filters?.startDate && filters?.endDate) {
      queryBuilder = queryBuilder.andWhere('wastage.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }
    
    if (filters?.reason) {
      queryBuilder = queryBuilder.andWhere('wastage.reason = :reason', {
        reason: filters.reason,
      });
    }
    
    return queryBuilder.orderBy('wastage.date', 'DESC').getMany();
  }

  /**
   * Find a specific wastage record by ID
   */
  async findOne(id: string): Promise<StockWastage> {
    const wastage = await this.wastageRepository.findOne({
      where: { id },
      relations: ['stockItem', 'recordedBy'],
    });
    
    if (!wastage) {
      throw new NotFoundException(`Wastage record with ID ${id} not found`);
    }
    
    return wastage;
  }
  
  /**
   * Get summary of wastage by reason
   */
  async getWastageSummaryByReason(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ reason: string; count: number; totalQuantity: number; totalValue: number }[]> {
    const queryBuilder = this.wastageRepository.createQueryBuilder('wastage')
      .select('wastage.reason', 'reason')
      .addSelect('COUNT(wastage.id)', 'count')
      .addSelect('SUM(wastage.quantity)', 'totalQuantity')
      .addSelect('SUM(wastage.quantity * stockItem.costPrice)', 'totalValue')
      .leftJoin('wastage.stockItem', 'stockItem');
      
    if (startDate && endDate) {
      queryBuilder.andWhere('wastage.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    return queryBuilder
      .groupBy('wastage.reason')
      .getRawMany();
  }
  
  /**
   * Get wastage statistics by stock item
   */
  async getWastageByStockItem(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ stockItemId: string; stockItemName: string; totalQuantity: number; totalValue: number }[]> {
    const queryBuilder = this.wastageRepository.createQueryBuilder('wastage')
      .select('stockItem.id', 'stockItemId')
      .addSelect('stockItem.name', 'stockItemName')
      .addSelect('SUM(wastage.quantity)', 'totalQuantity')
      .addSelect('SUM(wastage.quantity * stockItem.costPrice)', 'totalValue')
      .leftJoin('wastage.stockItem', 'stockItem');
      
    if (startDate && endDate) {
      queryBuilder.andWhere('wastage.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    return queryBuilder
      .groupBy('stockItem.id')
      .addGroupBy('stockItem.name')
      .getRawMany();
  }
  
  /**
   * Get comprehensive wastage analytics
   */
  async getWastageAnalytics(startDate?: Date, endDate?: Date) {
    // Get summary by reason
    const byReason = await this.getWastageSummaryByReason(startDate, endDate);
    
    // Get summary by stock item
    const byStockItem = await this.getWastageByStockItem(startDate, endDate);
    
    // Get total wastage value
    const totalQuery = this.wastageRepository.createQueryBuilder('wastage')
      .select('SUM(wastage.quantity * stockItem.costPrice)', 'totalValue')
      .leftJoin('wastage.stockItem', 'stockItem');
      
    if (startDate && endDate) {
      totalQuery.andWhere('wastage.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    const totalValue = await totalQuery.getRawOne();
    
    return {
      byReason,
      byStockItem,
      totalValue: totalValue?.totalValue || 0,
      period: {
        startDate,
        endDate,
      },
    };
  }
  
  /**
   * Delete a wastage record
   */
  async remove(id: string): Promise<void> {
    const wastage = await this.findOne(id);
    await this.wastageRepository.remove(wastage);
  }
}
