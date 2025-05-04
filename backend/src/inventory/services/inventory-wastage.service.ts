import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryWastage, WastageReason } from '../../entities/inventory-wastage.entity';
import { Product } from '../../entities/product.entity';
import { InventoryBatch } from '../../entities/inventory-batch.entity';
import { CreateWastageRecordDto } from '../dto/create-wastage-record.dto';
import { User } from '../../entities/user.entity';
import { InventoryTransactionService } from './inventory-transaction.service';
import { TransactionType } from '../../entities/inventory-transaction.entity';

/**
 * Service to manage inventory wastage records
 * Tracks products that are wasted due to expiry, damage, or other reasons
 */
@Injectable()
export class InventoryWastageService {
  constructor(
    @InjectRepository(InventoryWastage)
    private wastageRepository: Repository<InventoryWastage>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    private transactionService: InventoryTransactionService
  ) {}

  /**
   * Create a new wastage record and deduct stock accordingly
   */
  async create(createWastageDto: CreateWastageRecordDto, user: User): Promise<InventoryWastage> {
    // Verify product exists
    const product = await this.productRepository.findOne({ 
      where: { id: createWastageDto.productId }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createWastageDto.productId} not found`);
    }

    // If batch is specified, verify it exists
    let batch: InventoryBatch | null = null;
    if (createWastageDto.batchId) {
      batch = await this.batchRepository.findOne({ 
        where: { 
          id: createWastageDto.batchId,
          isActive: true
        }
      });

      if (!batch) {
        throw new NotFoundException(`Batch with ID ${createWastageDto.batchId} not found`);
      }

      // Ensure batch has enough quantity
      if (Number(batch.quantity) < createWastageDto.quantity) {
        throw new BadRequestException(`Batch does not have enough quantity. Available: ${batch.quantity}`);
      }
    }

    // Create wastage record
    const wastage = this.wastageRepository.create({
      ...createWastageDto,
      reportedById: user.id,
    });

    const savedWastage = await this.wastageRepository.save(wastage);

    // Deduct from inventory
    await this.transactionService.create({
      productId: createWastageDto.productId,
      type: TransactionType.OUT,
      quantity: createWastageDto.quantity,
      unitPrice: 0, // Wastage has no sale value
      reference: `Wastage: ${WastageReason[createWastageDto.reason]}`,
      notes: createWastageDto.notes || `Product wastage due to ${WastageReason[createWastageDto.reason]}`
    }, user);

    // If batch specified, update batch quantity
    if (batch) {
      batch.quantity = Number(batch.quantity) - createWastageDto.quantity;
      await this.batchRepository.save(batch);
    }

    return savedWastage;
  }

  /**
   * Find all wastage records, optionally filtered by date range and product
   */
  async findAll(
    startDate?: Date, 
    endDate?: Date, 
    productId?: string,
    reason?: WastageReason
  ): Promise<InventoryWastage[]> {
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }
    
    if (productId) {
      where.productId = productId;
    }
    
    if (reason) {
      where.reason = reason;
    }

    return this.wastageRepository.find({
      where,
      relations: ['product', 'batch', 'reportedBy'],
      order: { date: 'DESC' }
    });
  }

  /**
   * Find wastage record by ID
   */
  async findOne(id: string): Promise<InventoryWastage> {
    const wastage = await this.wastageRepository.findOne({
      where: { id },
      relations: ['product', 'batch', 'reportedBy']
    });

    if (!wastage) {
      throw new NotFoundException(`Wastage record with ID ${id} not found`);
    }

    return wastage;
  }

  /**
   * Get wastage summary by reason for a specified period
   */
  async getWastageSummaryByReason(
    startDate: Date, 
    endDate: Date
  ): Promise<{ reason: string; quantity: number; count: number }[]> {
    const result = await this.wastageRepository
      .createQueryBuilder('wastage')
      .select('wastage.reason', 'reason')
      .addSelect('SUM(wastage.quantity)', 'quantity')
      .addSelect('COUNT(wastage.id)', 'count')
      .where('wastage.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('wastage.reason')
      .getRawMany();

    return result.map(item => ({
      reason: item.reason,
      quantity: Number(item.quantity),
      count: Number(item.count)
    }));
  }

  /**
   * Get wastage by product for a specified period
   */
  async getWastageByProduct(
    startDate: Date, 
    endDate: Date
  ): Promise<{ productId: string; productName: string; quantity: number; value: number }[]> {
    const result = await this.wastageRepository
      .createQueryBuilder('wastage')
      .leftJoin('wastage.product', 'product')
      .select('wastage.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(wastage.quantity)', 'quantity')
      .addSelect('SUM(wastage.quantity * product.costPrice)', 'value')
      .where('wastage.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('wastage.productId')
      .addGroupBy('product.name')
      .getRawMany();

    return result.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: Number(item.quantity),
      value: Number(item.value)
    }));
  }

  /**
   * Get comprehensive wastage analytics data for dashboard
   */
  async getWastageAnalytics(startDate: Date, endDate: Date) {
    // Get total records count
    const totalRecords = await this.wastageRepository.count({
      where: { date: Between(startDate, endDate) }
    });

    // Get total quantity and value
    const totalsQuery = await this.wastageRepository
      .createQueryBuilder('wastage')
      .leftJoin('wastage.product', 'product')
      .select('SUM(wastage.quantity)', 'totalQuantity')
      .addSelect('SUM(wastage.quantity * COALESCE(product.costPrice, 0))', 'totalValue')
      .where('wastage.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    // Get wastage by reason
    const byReason = await this.getWastageSummaryByReason(startDate, endDate);

    // Get wastage by product
    const byProduct = await this.getWastageByProduct(startDate, endDate);

    // Get monthly breakdown
    const monthlyData = await this.wastageRepository
      .createQueryBuilder('wastage')
      .leftJoin('wastage.product', 'product')
      .select('TO_CHAR(wastage.date, \'YYYY-MM\')', 'month')
      .addSelect('COUNT(wastage.id)', 'count')
      .addSelect('SUM(wastage.quantity)', 'quantity')
      .addSelect('SUM(wastage.quantity * COALESCE(product.costPrice, 0))', 'value')
      .where('wastage.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalRecords,
      totalQuantity: Number(totalsQuery?.totalQuantity || 0),
      totalValue: Number(totalsQuery?.totalValue || 0),
      byReason,
      byProduct,
      monthlyData: monthlyData.map(item => ({
        month: item.month,
        count: Number(item.count),
        quantity: Number(item.quantity),
        value: Number(item.value)
      }))
    };
  }
}
