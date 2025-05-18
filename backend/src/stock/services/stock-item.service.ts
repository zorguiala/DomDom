import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { StockItem } from '../../entities/stock-item.entity';
import { StockItemType, StockItemWithMetrics } from '../types/stock.types';

/**
 * Service for managing stock items (raw materials and finished products)
 */
@Injectable()
export class StockItemService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
  ) {}

  /**
   * Create a new stock item
   */
  async create(createStockItemDto: CreateStockItemDto): Promise<StockItem> {
    // Convert DTO to entity properties explicitly
    const stockItem = this.stockItemRepository.create({
      ...createStockItemDto,
      // Ensure enum type is properly set
      type: createStockItemDto.type as StockItemType,
    });
    return this.stockItemRepository.save(stockItem);
  }

  /**
   * Find all stock items
   */
  async findAll(): Promise<StockItem[]> {
    return this.stockItemRepository.find();
  }

  /**
   * Find stock items by type (raw or finished)
   */
  async findByType(type: StockItemType): Promise<StockItem[]> {
    return this.stockItemRepository.find({ where: { type } });
  }

  /**
   * Find a single stock item by ID
   */
  async findOne(id: string): Promise<StockItem> {
    const stockItem = await this.stockItemRepository.findOne({ where: { id } });
    if (!stockItem) {
      throw new NotFoundException(`Stock item with ID ${id} not found`);
    }
    return stockItem;
  }

  /**
   * Update a stock item
   */
  async update(id: string, updateStockItemDto: Partial<CreateStockItemDto>): Promise<StockItem> {
    const stockItem = await this.findOne(id);
    Object.assign(stockItem, updateStockItemDto);
    return this.stockItemRepository.save(stockItem);
  }

  /**
   * Remove a stock item
   */
  async remove(id: string): Promise<void> {
    const stockItem = await this.findOne(id);
    await this.stockItemRepository.remove(stockItem);
  }

  /**
   * Find items with stock below their minimum quantity
   */
  async findLowStockItems(): Promise<StockItem[]> {
    return this.stockItemRepository
      .createQueryBuilder('stockItem')
      .where('stockItem.currentQuantity <= stockItem.minimumQuantity')
      .andWhere('stockItem.minimumQuantity > 0')
      .getMany();
  }

  /**
   * Calculate the total value of all stock
   */
  async calculateTotalStockValue(): Promise<number> {
    const stockItems = await this.stockItemRepository.find();
    return stockItems.reduce(
      (total, item) => total + item.currentQuantity * item.costPrice,
      0
    );
  }

  /**
   * Get summary of stock metrics
   */
  async getStockSummary() {
    const allItems = await this.stockItemRepository.find();
    const rawMaterials = allItems.filter(item => item.type === StockItemType.RAW);
    const finishedProducts = allItems.filter(item => item.type === StockItemType.FINISHED);
    
    const lowStockItems = allItems.filter(
      item => item.minimumQuantity > 0 && item.currentQuantity <= item.minimumQuantity
    );

    return {
      totalItems: allItems.length,
      totalValue: allItems.reduce((sum, item) => sum + (item.currentQuantity * item.costPrice), 0),
      rawMaterialsValue: rawMaterials.reduce((sum, item) => sum + (item.currentQuantity * item.costPrice), 0),
      finishedProductsValue: finishedProducts.reduce((sum, item) => sum + (item.currentQuantity * item.costPrice), 0),
      lowStockItemsCount: lowStockItems.length
    };
  }
}
