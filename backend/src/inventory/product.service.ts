import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async findAll(
    search?: string,
    isRawMaterial?: boolean,
    isActive = true,
  ): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.where('(product.name ILIKE :search OR product.sku ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (typeof isRawMaterial === 'boolean') {
      query.andWhere('product.isRawMaterial = :isRawMaterial', {
        isRawMaterial,
      });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['bomItems'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    // Soft delete by marking as inactive instead of removing
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { sku } });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.currentStock = quantity;
    return this.productRepository.save(product);
  }
}
