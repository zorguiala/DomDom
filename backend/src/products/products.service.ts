import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { LowStockAlert } from '../types/product.types';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepository: Repository<InventoryTransaction>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      currentStock: createProductDto.initialStock,
    });
    return this.productRepository.save(product);
  }

  async findAll(search?: string, isRawMaterial?: boolean, isActive?: boolean): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        {
          search: `%${search}%`,
        }
      );
    }

    if (isRawMaterial !== undefined) {
      query.andWhere('product.isRawMaterial = :isRawMaterial', { isRawMaterial });
    }

    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { sku } });
  }

  async updateStock(id: string, quantity: number, type: 'in' | 'out'): Promise<Product> {
    const product = await this.findOne(id);
    if (type === 'out' && product.currentStock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }
    product.currentStock += type === 'in' ? quantity : -quantity;
    return this.productRepository.save(product);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { barcode } });
  }

  async getStockHistory(
    id: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryTransaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .where('product.id = :id', { id });

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    return query.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  async checkLowStockAlert(id: string): Promise<LowStockAlert> {
    const product = await this.findOne(id);
    return {
      isLow: product.currentStock <= product.minimumStock,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      product,
    };
  }

  async updateBarcode(id: string, barcode: string): Promise<Product> {
    const existingProduct = await this.findByBarcode(barcode);
    if (existingProduct && existingProduct.id !== id) {
      throw new BadRequestException('Barcode already exists');
    }

    const product = await this.findOne(id);
    product.barcode = barcode;
    return this.productRepository.save(product);
  }
}
