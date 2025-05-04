import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { LowStockAlert, StockLevel } from '../types/inventory.types';

@Injectable()
export class InventoryStockService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (threshold !== undefined) {
      query.andWhere('product.currentStock <= :threshold', { threshold });
    } else {
      query.andWhere(
        '(product.minimumStock > 0 AND product.currentStock <= product.minimumStock) OR ' +
          '(product.minimumStock = 0 AND product.currentStock <= 5)'
      );
    }

    return query.getMany();
  }

  async getLowStockAlerts(threshold?: number): Promise<{
    products: Product[];
    totalValue: number;
    criticalItems: Product[];
  }> {
    const lowStockProducts = await this.getLowStockProducts(threshold);
    const criticalItems = lowStockProducts.filter(
      (product) => product.currentStock <= (product.minimumStock || 0) / 2
    );

    const totalValue = lowStockProducts.reduce(
      (sum, product) => sum + product.currentStock * (product.lastPurchasePrice || 0),
      0
    );

    return {
      products: lowStockProducts,
      totalValue,
      criticalItems,
    };
  }

  async checkLowStockAlert(productId: string): Promise<LowStockAlert> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      isLow: product.currentStock <= (product.minimumStock || 5),
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      product,
    };
  }

  private getStockStatus(quantity: number): 'LOW' | 'NORMAL' | 'HIGH' {
    if (quantity <= 10) return 'LOW';
    if (quantity <= 50) return 'NORMAL';
    return 'HIGH';
  }

  async getInventoryStatus() {
    const products = await this.productRepository.find({
      select: ['id', 'name', 'currentStock', 'minimumStock'],
      where: { isActive: true },
    });

    return products.map((p) => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.currentStock,
      status: this.getStockStatus(p.currentStock),
    }));
  }
  
  /**
   * Get current stock levels for all products or specific products
   * @param productIds Optional array of product IDs to filter
   * @returns Array of stock level objects with product details
   */
  async getStockLevels(productIds?: string[]): Promise<StockLevel[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    if (productIds && productIds.length > 0) {
      queryBuilder.where('product.id IN (:...productIds)', { productIds });
    }
    
    const products = await queryBuilder
      .select([
        'product.id as productId',
        'product.name as productName',
        'product.currentStock as currentQuantity',
        'product.minimumStock as minimumQuantity',
        'product.unit as unit',
        'product.costPrice as costPrice'
      ])
      .getRawMany();
    
    return products.map(p => {
      const currentQuantity = Number(p.currentQuantity);
      return {
        productId: p.productId,
        productName: p.productName,
        currentQuantity: currentQuantity,
        currentStock: currentQuantity, // Add alias for backward compatibility
        minimumQuantity: Number(p.minimumQuantity),
        minimumStock: Number(p.minimumQuantity), // Add alias for backward compatibility
        unit: p.unit,
        costPrice: Number(p.costPrice),
        status: this.getStockStatus(currentQuantity)
      };
    });
  }
}
