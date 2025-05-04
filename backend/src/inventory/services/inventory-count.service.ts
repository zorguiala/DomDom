import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InventoryCount, InventoryCountItem, InventoryCountStatus } from '../../entities/inventory-count.entity';
import { Product } from '../../entities/product.entity';
import { CreateInventoryCountDto, InventoryCountItemDto } from '../dto/create-inventory-count.dto';
import { User } from '../../entities/user.entity';
import { InventoryStockService } from './inventory-stock.service';
import { InventoryTransactionService } from './inventory-transaction.service';
import { TransactionType } from '../../entities/inventory-transaction.entity';

/**
 * Service to manage inventory counts and reconciliation
 */
@Injectable()
export class InventoryCountService {
  constructor(
    @InjectRepository(InventoryCount)
    private countRepository: Repository<InventoryCount>,
    @InjectRepository(InventoryCountItem)
    private countItemRepository: Repository<InventoryCountItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockService: InventoryStockService,
    private transactionService: InventoryTransactionService
  ) {}

  /**
   * Create a new inventory count session
   */
  async create(createCountDto: CreateInventoryCountDto, user: User): Promise<InventoryCount> {
    // Create count record
    const countRecord = this.countRepository.create({
      countDate: createCountDto.countDate,
      status: createCountDto.status,
      notes: createCountDto.notes,
      initiatedById: user.id,
      items: [],
    });

    // Process items
    if (createCountDto.items && createCountDto.items.length > 0) {
      // Get unique product IDs
      const productIds = [...new Set(createCountDto.items.map(item => item.productId))];
      
      // Get current stock levels for all products
      const stockLevels = await this.stockService.getStockLevels(productIds);
      
      // Map for quick lookup
      const stockMap = new Map(
        stockLevels.map(item => [item.productId, item.currentStock])
      );

      // Create count items with calculated discrepancies
      const countItems = createCountDto.items.map(item => {
        const expectedQty = stockMap.get(item.productId) || 0;
        const actualQty = item.actualQuantity;
        const discrepancy = actualQty - expectedQty;

        return this.countItemRepository.create({
          productId: item.productId,
          productName: item.productName,
          batchId: item.batchId,
          batchNumber: item.batchNumber,
          expectedQuantity: expectedQty,
          actualQuantity: actualQty,
          discrepancy: discrepancy,
          notes: item.notes,
          isReconciled: item.isReconciled || false,
        });
      });

      countRecord.items = countItems;
    }

    return this.countRepository.save(countRecord);
  }

  /**
   * Find all inventory counts, with optional status filter
   */
  async findAll(status?: InventoryCountStatus): Promise<InventoryCount[]> {
    const where = status ? { status } : {};

    return this.countRepository.find({
      where,
      relations: ['items', 'initiatedBy', 'completedBy'],
      order: { countDate: 'DESC' }
    });
  }

  /**
   * Find inventory count by ID
   */
  async findOne(id: string): Promise<InventoryCount> {
    const count = await this.countRepository.findOne({
      where: { id },
      relations: ['items', 'initiatedBy', 'completedBy']
    });

    if (!count) {
      throw new NotFoundException(`Inventory count with ID ${id} not found`);
    }

    return count;
  }

  /**
   * Update inventory count status
   */
  async updateStatus(
    id: string, 
    status: InventoryCountStatus, 
    user: User
  ): Promise<InventoryCount> {
    const count = await this.findOne(id);
    
    // Validate status transitions
    if (count.status === InventoryCountStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed inventory count');
    }

    if (count.status === InventoryCountStatus.CANCELED) {
      throw new BadRequestException('Cannot update a canceled inventory count');
    }

    // If marking as completed, we need completed by user
    if (status === InventoryCountStatus.COMPLETED) {
      count.completedById = user.id;
    } else {
      // For non-completed status, use an empty string as nullable is not supported
      // This preserves the database schema integrity while indicating no completing user
      count.completedById = '';
    }

    count.status = status;
    return this.countRepository.save(count);
  }

  /**
   * Reconcile inventory discrepancies
   * This will create adjustment transactions to match actual quantities
   */
  async reconcileInventory(countId: string, user: User): Promise<void> {
    const count = await this.findOne(countId);
    
    if (count.status !== InventoryCountStatus.COMPLETED) {
      throw new BadRequestException('Only completed inventory counts can be reconciled');
    }

    // Process each item with discrepancy
    for (const item of count.items) {
      if (item.isReconciled || item.discrepancy === 0) {
        continue;
      }

      // Create adjustment transaction
      const transactionType = item.discrepancy > 0 
        ? TransactionType.IN 
        : TransactionType.OUT;
      
      const quantity = Math.abs(Number(item.discrepancy));
      
      // Get product cost for valuation
      const product = await this.productRepository.findOne({
        where: { id: item.productId }
      });

      if (!product) {
        continue; // Skip if product not found
      }
      
      await this.transactionService.create({
        productId: item.productId,
        type: transactionType,
        quantity,
        unitPrice: Number(product.costPrice),
        reference: `Inventory Count #${count.id}`,
        notes: `Inventory reconciliation adjustment: ${item.notes || ''}`
      }, user);

      // Mark as reconciled
      item.isReconciled = true;
      await this.countItemRepository.save(item);
    }
  }

  /**
   * Generate an inventory count template for all products or selected categories
   */
  async generateCountTemplate(
    categoryIds?: string[],
    includeInactive = false
  ): Promise<Partial<InventoryCountItemDto>[]> {
    // Build query
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // Apply filters
    if (!includeInactive) {
      queryBuilder.where('product.isActive = :isActive', { isActive: true });
    }
    
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
    }
    
    // Get products
    const products = await queryBuilder.getMany();
    
    // Get current stock levels
    const productIds = products.map(p => p.id);
    const stockLevels = await this.stockService.getStockLevels(productIds);
    
    // Convert to map for easier lookup
    const stockMap = new Map(
      stockLevels.map(item => [item.productId, item.currentStock])
    );
    
    // Build template items
    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      expectedQuantity: stockMap.get(product.id) || 0,
      actualQuantity: 0, // To be filled during count
    }));
  }
}
