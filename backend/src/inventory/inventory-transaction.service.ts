import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { Product } from '../entities/product.entity';
import { TransactionType } from '../entities/inventory-transaction.entity';

@Injectable()
export class InventoryTransactionService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createInventoryTransactionDto: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    const product = await this.productRepository.findOne({ where: { id: createInventoryTransactionDto.productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${createInventoryTransactionDto.productId} not found`);
    }

    const transaction = this.inventoryTransactionRepository.create({
      ...createInventoryTransactionDto,
      product
    });

    // Update product stock
    if (createInventoryTransactionDto.type === TransactionType.PURCHASE || 
        createInventoryTransactionDto.type === TransactionType.PRODUCTION_IN) {
      product.currentStock += createInventoryTransactionDto.quantity;
    } else {
      if (product.currentStock < createInventoryTransactionDto.quantity) {
        throw new Error('Insufficient stock');
      }
      product.currentStock -= createInventoryTransactionDto.quantity;
    }

    await this.productRepository.save(product);
    return this.inventoryTransactionRepository.save(transaction);
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    type?: string,
    productId?: string
  ): Promise<InventoryTransaction[]> {
    const query = this.inventoryTransactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product');

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    if (productId) {
      query.andWhere('transaction.productId = :productId', { productId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<InventoryTransaction> {
    const transaction = await this.inventoryTransactionRepository.findOne({
      where: { id },
      relations: ['product']
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }
} 