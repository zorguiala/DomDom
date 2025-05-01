import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransaction, TransactionType } from '../../entities/inventory-transaction.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { CreateInventoryTransactionDto } from '../dto/create-inventory-transaction.dto';
import { BatchInventoryDto } from '../dto/batch-inventory.dto';
import { BarcodeScanDto } from '../dto/barcode-scan.dto';

@Injectable()
export class InventoryTransactionService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(
    createInventoryTransactionDto: CreateInventoryTransactionDto,
    user: User
  ): Promise<InventoryTransaction> {
    const product = await this.productRepository.findOne({
      where: { id: createInventoryTransactionDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createInventoryTransactionDto.productId} not found`
      );
    }

    const transaction = this.inventoryTransactionRepository.create({
      ...createInventoryTransactionDto,
      product,
      createdBy: user,
    });

    await this.updateProductStock(
      product,
      createInventoryTransactionDto.type,
      createInventoryTransactionDto.quantity
    );
    await this.productRepository.save(product);
    return this.inventoryTransactionRepository.save(transaction);
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    type?: string,
    productId?: string
  ): Promise<InventoryTransaction[]> {
    const query = this.inventoryTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy');

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
      query.andWhere('product.id = :productId', { productId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<InventoryTransaction> {
    const transaction = await this.inventoryTransactionRepository.findOne({
      where: { id },
      relations: ['product', 'createdBy'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async processBarcodeScan(
    barcodeScanDto: BarcodeScanDto,
    user: User
  ): Promise<InventoryTransaction> {
    const product = await this.productRepository.findOne({
      where: { barcode: barcodeScanDto.barcode },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcodeScanDto.barcode} not found`);
    }

    return this.create(
      {
        productId: product.id,
        type: barcodeScanDto.type,
        quantity: barcodeScanDto.quantity,
        unitPrice: barcodeScanDto.unitPrice || product.lastPurchasePrice || 0,
        reference: barcodeScanDto.reference,
        notes: barcodeScanDto.notes,
      },
      user
    );
  }

  async processBatchTransactions(
    batchDto: BatchInventoryDto,
    user: User
  ): Promise<InventoryTransaction[]> {
    const transactions: InventoryTransaction[] = [];

    for (const item of batchDto.items) {
      try {
        const transaction = await this.create(
          {
            productId: item.productId,
            type: item.type,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            reference: item.reference,
            notes: item.notes,
          },
          user
        );
        transactions.push(transaction);
      } catch (error) {
        console.error(`Error processing batch item: ${error.message}`);
      }
    }

    return transactions;
  }

  private async updateProductStock(
    product: Product,
    type: TransactionType,
    quantity: number
  ): Promise<void> {
    switch (type) {
      case TransactionType.PURCHASE:
      case TransactionType.PRODUCTION_IN:
        product.currentStock = (product.currentStock || 0) + quantity;
        break;
      case TransactionType.SALE_OUT:
      case TransactionType.PRODUCTION_OUT:
        if ((product.currentStock || 0) < quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
        product.currentStock = (product.currentStock || 0) - quantity;
        break;
      case TransactionType.ADJUSTMENT:
        product.currentStock = quantity;
        break;
    }
    await this.productRepository.save(product);
  }
}
