import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockBatch } from '../../entities/stock-batch.entity';
import { Product } from '../../entities/product.entity';
import { validate as isUUID } from 'uuid';

interface CreateStockBatchDto {
  productId: string;
  quantity: number;
  batchNumber: string;
  expiryDate?: Date;
  notes?: string;
  unitCost?: number;
}

interface UpdateStockBatchDto {
  quantity?: number;
  isActive?: boolean;
  expiryDate?: Date;
  notes?: string;
  unitCost?: number;
}

@Injectable()
export class StockBatchService {
  constructor(
    @InjectRepository(StockBatch)
    private stockBatchRepository: Repository<StockBatch>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async createBatch(createBatchDto: CreateStockBatchDto): Promise<StockBatch> {
    const { productId, quantity, batchNumber, expiryDate, notes, unitCost } = createBatchDto;

    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const newBatch = this.stockBatchRepository.create({
      productId,
      quantity,
      batchNumber,
      expiryDate,
      notes,
      unitCost: unitCost || product.costPrice,
      receivedDate: new Date(),
      isActive: true,
    });

    return this.stockBatchRepository.save(newBatch);
  }

  async findAll(
    productId?: string,
    isActive?: boolean,
    expiryDateFrom?: Date,
    expiryDateTo?: Date
  ): Promise<StockBatch[]> {
    const whereClause: Record<string, unknown> = {};

    if (productId) {
      whereClause.productId = productId;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    if (expiryDateFrom && expiryDateTo) {
      whereClause.expiryDate = Between(expiryDateFrom, expiryDateTo);
    }

    return this.stockBatchRepository.find({
      where: whereClause,
      relations: ['product'],
      order: { expiryDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StockBatch> {
    if (!isUUID(id)) {
      throw new Error(`Invalid UUID format for ID: ${id}`);
    }

    const batch = await this.stockBatchRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateStockBatchDto): Promise<StockBatch> {
    const batch = await this.findOne(id);

    // Update fields
    const updatedFields: Partial<StockBatch> = {};

    if (updateBatchDto.quantity !== undefined) {
      updatedFields.quantity = updateBatchDto.quantity;
    }

    if (updateBatchDto.isActive !== undefined) {
      updatedFields.isActive = updateBatchDto.isActive;
    }

    if (updateBatchDto.expiryDate !== undefined) {
      updatedFields.expiryDate = updateBatchDto.expiryDate;
    }

    if (updateBatchDto.notes !== undefined) {
      updatedFields.notes = updateBatchDto.notes;
    }

    if (updateBatchDto.unitCost !== undefined) {
      updatedFields.unitCost = updateBatchDto.unitCost;
    }

    // Apply updates
    Object.assign(batch, updatedFields);

    return this.stockBatchRepository.save(batch);
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    await this.stockBatchRepository.remove(batch);
  }

  async getExpiringBatches(daysThreshold: number = 30): Promise<StockBatch[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.stockBatchRepository.find({
      where: {
        expiryDate: Between(today, thresholdDate),
        isActive: true,
      },
      relations: ['product'],
    });
  }

  async updateBatchQuantity(id: string, quantityChange: number): Promise<StockBatch> {
    const batch = await this.findOne(id);

    const newQuantity = batch.quantity + quantityChange;

    if (newQuantity < 0) {
      throw new Error(
        `Cannot reduce quantity below 0. Current: ${batch.quantity}, Change: ${quantityChange}`
      );
    }

    batch.quantity = newQuantity;

    // If quantity becomes 0, mark as inactive
    if (newQuantity === 0) {
      batch.isActive = false;
    }

    return this.stockBatchRepository.save(batch);
  }
}
