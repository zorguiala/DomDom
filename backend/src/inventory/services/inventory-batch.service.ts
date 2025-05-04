import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThan, MoreThan, Between } from 'typeorm';
import { InventoryBatch } from '../../entities/inventory-batch.entity';
import { Product } from '../../entities/product.entity';
import { CreateInventoryBatchDto } from '../dto/create-inventory-batch.dto';
import { InventoryTransactionService } from './inventory-transaction.service';
import { TransactionType } from '../../entities/inventory-transaction.entity';
import { User } from '../../entities/user.entity';
import { BatchInventoryStatus } from '../types/inventory-batch.types';

@Injectable()
export class InventoryBatchService {
  constructor(
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private transactionService: InventoryTransactionService
  ) {}

  async create(createBatchDto: CreateInventoryBatchDto, user: User): Promise<InventoryBatch> {
    const product = await this.productRepository.findOne({ 
      where: { id: createBatchDto.productId }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createBatchDto.productId} not found`);
    }

    // Check if batch number already exists for this product
    const existingBatch = await this.batchRepository.findOne({
      where: {
        productId: createBatchDto.productId,
        batchNumber: createBatchDto.batchNumber,
        isActive: true
      }
    });

    if (existingBatch) {
      throw new BadRequestException(`Batch number ${createBatchDto.batchNumber} already exists for this product`);
    }

    // Create batch
    const batch = this.batchRepository.create({
      ...createBatchDto,
      product
    });

    const savedBatch = await this.batchRepository.save(batch);

    // Record inventory transaction
    if (createBatchDto.quantity > 0) {
      await this.transactionService.create({
        productId: createBatchDto.productId,
        type: TransactionType.IN,
        quantity: createBatchDto.quantity,
        unitPrice: createBatchDto.unitCost,
        reference: `Batch: ${createBatchDto.batchNumber}`,
        notes: createBatchDto.notes || 'Batch received'
      }, user);
    }

    return savedBatch;
  }

  async findAll(productId?: string): Promise<InventoryBatch[]> {
    const where: any = { isActive: true };
    
    if (productId) {
      where.productId = productId;
    }

    return this.batchRepository.find({
      where,
      relations: ['product'],
      order: { receivedDate: 'DESC' }
    });
  }

  async findOne(id: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id, isActive: true },
      relations: ['product']
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async findByBatchNumber(productId: string, batchNumber: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({
      where: {
        productId,
        batchNumber,
        isActive: true
      },
      relations: ['product']
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchNumber} for product ${productId} not found`);
    }

    return batch;
  }

  async update(id: string, updateData: Partial<InventoryBatch>): Promise<InventoryBatch> {
    const batch = await this.findOne(id);
    
    // Prevent changing product or batch number
    delete updateData.productId;
    delete updateData.batchNumber;
    delete updateData.product;

    Object.assign(batch, updateData);
    
    return this.batchRepository.save(batch);
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    batch.isActive = false;
    await this.batchRepository.save(batch);
  }

  async getExpiringBatches(daysThreshold: number = 30): Promise<InventoryBatch[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return this.batchRepository.find({
      where: {
        expiryDate: Between(today, thresholdDate),
        quantity: MoreThan(0),
        isActive: true
      },
      relations: ['product']
    });
  }

  async getExpiredBatches(): Promise<InventoryBatch[]> {
    const today = new Date();

    return this.batchRepository.find({
      where: {
        expiryDate: LessThan(today),
        quantity: MoreThan(0),
        isActive: true
      },
      relations: ['product']
    });
  }

  async getBatchInventoryStatus(): Promise<BatchInventoryStatus[]> {
    const batches = await this.batchRepository.find({
      where: { isActive: true, quantity: MoreThan(0) },
      relations: ['product']
    });

    const today = new Date();
    
    return batches.map(batch => {
      // Calculate days until expiry
      let daysUntilExpiry: number | undefined;
      let isExpired = false;
      
      if (batch.expiryDate) {
        const expiryTime = batch.expiryDate.getTime();
        const todayTime = today.getTime();
        daysUntilExpiry = Math.floor((expiryTime - todayTime) / (1000 * 60 * 60 * 24));
        isExpired = daysUntilExpiry < 0;
      }

      // Determine if stock is low (30% of initial quantity or less)
      const initialQuantity = Number(batch.quantity) || 0;
      const isLow = initialQuantity > 0 && Number(batch.quantity) <= (initialQuantity * 0.3);

      return {
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        productId: batch.productId,
        productName: batch.product.name,
        initialQuantity: initialQuantity,
        currentQuantity: Number(batch.quantity),
        unitCost: Number(batch.unitCost),
        totalValue: Number(batch.quantity) * Number(batch.unitCost),
        manufactureDate: batch.manufactureDate || undefined, // Convert null to undefined to match the type
        expiryDate: batch.expiryDate || undefined, // Convert null to undefined to match the type
        receivedDate: batch.receivedDate,
        daysUntilExpiry,
        isExpired,
        isLow
      };
    });
  }
}
