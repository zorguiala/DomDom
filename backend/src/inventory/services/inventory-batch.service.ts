import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryBatch } from '../../entities/inventory-batch.entity';
import { CreateInventoryBatchDto } from '../dto/create-inventory-batch.dto';
import { UpdateInventoryBatchDto } from '../dto/update-inventory-batch.dto';
import { Product } from '../../entities/product.entity';

@Injectable()
export class InventoryBatchService {
  constructor(
    @InjectRepository(InventoryBatch)
    private inventoryBatchRepository: Repository<InventoryBatch>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async createBatch(createBatchDto: CreateInventoryBatchDto): Promise<InventoryBatch> {
    const { productId, quantity, batchNumber, expiryDate, notes } = createBatchDto;

    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const newBatch = this.inventoryBatchRepository.create({
      productId,
      quantity,
      batchNumber,
      expiryDate,
      notes,
      receivedDate: new Date(),
      isActive: true,
    });

    return this.inventoryBatchRepository.save(newBatch);
  }

  async findAll(
    productId?: string,
    isActive?: boolean,
    expiryDateFrom?: Date,
    expiryDateTo?: Date
  ): Promise<InventoryBatch[]> {
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

    return this.inventoryBatchRepository.find({
      where: whereClause,
      relations: ['product'],
      order: { expiryDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<InventoryBatch> {
    const batch = await this.inventoryBatchRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateInventoryBatchDto): Promise<InventoryBatch> {
    const batch = await this.findOne(id);

    // Update fields
    const updatedFields: Partial<InventoryBatch> = {};

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

    // Apply updates
    Object.assign(batch, updatedFields);

    return this.inventoryBatchRepository.save(batch);
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    await this.inventoryBatchRepository.remove(batch);
  }

  async getExpiringBatches(daysThreshold: number = 30): Promise<InventoryBatch[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.inventoryBatchRepository.find({
      where: {
        expiryDate: Between(today, thresholdDate),
        isActive: true,
      },
      relations: ['product'],
    });
  }

  async updateBatchQuantity(id: string, quantityChange: number): Promise<InventoryBatch> {
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

    return this.inventoryBatchRepository.save(batch);
  }
}
