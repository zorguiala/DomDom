import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThan } from 'typeorm';
import { Product } from '../entities/product.entity';
import { InventoryTransaction, TransactionType } from '../entities/inventory-transaction.entity';

// Define interfaces for better type safety
interface InventoryValueReport {
  totalValue: number;
  rawMaterialsValue: number;
  finishedProductsValue: number;
  rawMaterialsCount: number;
  finishedProductsCount: number;
  productCount: number;
}

interface ProductMovementReport {
  product: Product;
  period: {
    startDate: Date;
    endDate: Date;
  };
  openingStock: number;
  closingStock: number;
  totalsByType: Record<string, number>;
  transactions: InventoryTransaction[];
  dailyMovement: DailyMovement[];
}

interface DailyMovement {
  date: string;
  openingBalance: number;
  in: number;
  out: number;
  closingBalance: number;
}

interface ProductTurnoverData {
  product: Product;
  unitsSold: number;
  averageInventory: number;
  turnoverRate: number;
}

interface ProductionInventoryImpact {
  period: {
    startDate: Date;
    endDate: Date;
  };
  productionIn: {
    transactions: InventoryTransaction[];
    byProduct: Record<string, ProductTransactionGroup>;
    totalQuantity: number;
    totalValue: number;
  };
  productionOut: {
    transactions: InventoryTransaction[];
    byProduct: Record<string, ProductTransactionGroup>;
    totalQuantity: number;
    totalValue: number;
  };
  netImpact: number;
}

interface ProductTransactionGroup {
  product: Product;
  totalQuantity: number;
  totalValue: number;
  transactions: InventoryTransaction[];
}

@Injectable()
export class InventoryReportingService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryTransaction)
    private transactionRepository: Repository<InventoryTransaction>,
    private dataSource: DataSource
  ) {}

  async getInventoryValueReport(): Promise<InventoryValueReport> {
    const products = await this.productRepository.find({
      where: { isActive: true },
    });

    const totalValue = products.reduce(
      (sum, product) => sum + (product.currentStock || 0) * (product.price || 0),
      0
    );

    const categorizedProducts = {
      rawMaterials: products.filter((p) => p.isRawMaterial),
      finishedProducts: products.filter((p) => !p.isRawMaterial),
    };

    const rawMaterialsValue = categorizedProducts.rawMaterials.reduce(
      (sum, product) => sum + (product.currentStock || 0) * (product.price || 0),
      0
    );

    const finishedProductsValue = categorizedProducts.finishedProducts.reduce(
      (sum, product) => sum + (product.currentStock || 0) * (product.price || 0),
      0
    );

    return {
      totalValue,
      rawMaterialsValue,
      finishedProductsValue,
      rawMaterialsCount: categorizedProducts.rawMaterials.length,
      finishedProductsCount: categorizedProducts.finishedProducts.length,
      productCount: products.length,
    };
  }

  async getProductMovement(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProductMovementReport> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get all transactions for the product in the period
    const transactions = await this.transactionRepository.find({
      where: {
        product: { id: productId },
        createdAt: Between(startDate, endDate),
      },
      relations: ['createdBy', 'product'],
      order: { createdAt: 'ASC' },
    });

    // Calculate opening stock by summing all transactions before start date
    const previousTransactions = await this.transactionRepository.find({
      where: {
        product: { id: productId },
        createdAt: LessThan(startDate),
      },
    });

    const openingStock = previousTransactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    // Calculate closing stock
    const closingStock =
      openingStock + transactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    // Group transactions by type
    const transactionsByType: Record<string, InventoryTransaction[]> = transactions.reduce(
      (acc, tx) => {
        const type = tx.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(tx);
        return acc;
      },
      {} as Record<string, InventoryTransaction[]>
    );

    // Calculate totals by type
    const totalsByType: Record<string, number> = {};
    Object.entries(transactionsByType).forEach(([type, txs]) => {
      totalsByType[type] = txs.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    });

    // Calculate daily movement
    const dailyMovement = this.calculateDailyMovement(transactions, openingStock);

    return {
      product,
      period: {
        startDate,
        endDate,
      },
      openingStock,
      closingStock,
      totalsByType,
      transactions,
      dailyMovement,
    };
  }

  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.currentStock <= product.minimumStock')
      .orWhere('product.currentStock <= :threshold AND product.minimumStock = 0', {
        threshold: threshold || 5,
      })
      .orderBy('product.currentStock', 'ASC')
      .getMany();
  }

  async getStockTurnoverRate(startDate: Date, endDate: Date): Promise<ProductTurnoverData[]> {
    // Get all products
    const products = await this.productRepository.find({
      where: { isActive: true },
    });

    const results: ProductTurnoverData[] = [];

    for (const product of products) {
      // Get transactions for the period
      const transactions = await this.transactionRepository.find({
        where: {
          product: { id: product.id },
          createdAt: Between(startDate, endDate),
          type: TransactionType.SALE_OUT,
        },
      });

      // Calculate total units sold
      const unitsSold = transactions.reduce(
        (sum, tx) => sum + Math.abs(tx.quantity || 0), // Quantity will be negative for sales
        0
      );

      // Calculate average inventory
      const previousTransactions = await this.transactionRepository.find({
        where: {
          product: { id: product.id },
          createdAt: LessThan(startDate),
        },
      });

      const openingStock = previousTransactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

      const averageInventory = ((openingStock || 0) + (product.currentStock || 0)) / 2;

      // Calculate turnover rate
      const turnoverRate = averageInventory > 0 ? unitsSold / averageInventory : 0;

      results.push({
        product,
        unitsSold,
        averageInventory,
        turnoverRate,
      });
    }

    // Sort by turnover rate (highest first)
    return results.sort((a, b) => b.turnoverRate - a.turnoverRate);
  }

  async getProductionInventoryImpact(
    startDate: Date,
    endDate: Date
  ): Promise<ProductionInventoryImpact> {
    // Get all transactions for production in the period
    const productionIn = await this.transactionRepository.find({
      where: {
        type: TransactionType.PRODUCTION_IN,
        createdAt: Between(startDate, endDate),
      },
      relations: ['product'],
    });

    const productionOut = await this.transactionRepository.find({
      where: {
        type: TransactionType.PRODUCTION_OUT,
        createdAt: Between(startDate, endDate),
      },
      relations: ['product'],
    });

    // Group by product
    const inByProduct = this.groupByProduct(productionIn);
    const outByProduct = this.groupByProduct(productionOut);

    // Calculate totals
    const totalIn = productionIn.reduce(
      (sum, tx) => sum + (tx.quantity || 0) * (tx.unitPrice || 0),
      0
    );

    const totalOut = productionOut.reduce(
      (sum, tx) => sum + Math.abs(tx.quantity || 0) * (tx.unitPrice || 0),
      0
    );

    return {
      period: {
        startDate,
        endDate,
      },
      productionIn: {
        transactions: productionIn,
        byProduct: inByProduct,
        totalQuantity: productionIn.reduce((sum, tx) => sum + (tx.quantity || 0), 0),
        totalValue: totalIn,
      },
      productionOut: {
        transactions: productionOut,
        byProduct: outByProduct,
        totalQuantity: productionOut.reduce((sum, tx) => sum + Math.abs(tx.quantity || 0), 0),
        totalValue: totalOut,
      },
      netImpact: totalIn - totalOut,
    };
  }

  private calculateDailyMovement(
    transactions: InventoryTransaction[],
    openingBalance: number
  ): DailyMovement[] {
    const dailyMap = new Map<string, DailyMovement>();

    let runningBalance = openingBalance;

    // Sort transactions by timestamp
    transactions.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    // Group transactions by date
    transactions.forEach((tx) => {
      const txDate = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const date = txDate.toISOString().split('T')[0];

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          openingBalance: runningBalance,
          in: 0,
          out: 0,
          closingBalance: runningBalance,
        });
      }

      const entry = dailyMap.get(date)!;

      if ((tx.quantity || 0) > 0) {
        entry.in += tx.quantity || 0;
      } else {
        entry.out += Math.abs(tx.quantity || 0);
      }

      runningBalance += tx.quantity || 0;
      entry.closingBalance = runningBalance;

      dailyMap.set(date, entry);
    });

    return Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private groupByProduct(
    transactions: InventoryTransaction[]
  ): Record<string, ProductTransactionGroup> {
    return transactions.reduce(
      (acc, tx) => {
        if (!tx.product || !tx.product.id) {
          return acc;
        }

        const productId = tx.product.id;

        if (!acc[productId]) {
          acc[productId] = {
            product: tx.product,
            totalQuantity: 0,
            totalValue: 0,
            transactions: [],
          };
        }

        const absQuantity = Math.abs(tx.quantity || 0);
        acc[productId].totalQuantity += absQuantity;
        acc[productId].totalValue += absQuantity * (tx.unitPrice || 0);
        acc[productId].transactions.push(tx);

        return acc;
      },
      {} as Record<string, ProductTransactionGroup>
    );
  }
}
