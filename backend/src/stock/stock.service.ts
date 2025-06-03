import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all stock items with optional filtering
   */
  async findAllStockItems(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.StockItemWhereUniqueInput;
    where?: Prisma.StockItemWhereInput;
    orderBy?: Prisma.StockItemOrderByWithRelationInput;
    include?: Prisma.StockItemInclude;
  }) {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.stockItem.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: include || { product: true },
    });
  }

  /**
   * Get a single stock item by ID
   */
  async findStockItemById(id: string, include?: Prisma.StockItemInclude) {
    const stockItem = await this.prisma.stockItem.findUnique({
      where: { id },
      include: include || { product: true },
    });

    if (!stockItem) {
      throw new NotFoundException(`Stock item with ID ${id} not found`);
    }

    return stockItem;
  }

  /**
   * Create a new stock item
   */
  async createStockItem(data: Prisma.StockItemCreateInput) {
    return this.prisma.stockItem.create({
      data,
      include: { product: true },
    });
  }

  /**
   * Update an existing stock item
   */
  async updateStockItem(id: string, data: Prisma.StockItemUpdateInput) {
    try {
      return await this.prisma.stockItem.update({
        where: { id },
        data,
        include: { product: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Stock item with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete a stock item
   */
  async deleteStockItem(id: string) {
    try {
      return await this.prisma.stockItem.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Stock item with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Find stock items by product ID
   */
  async findStockItemsByProductId(productId: string) {
    return this.prisma.stockItem.findMany({
      where: { productId },
      include: { product: true },
    });
  }

  /**
   * Get total quantity of a product in stock
   */
  async getProductTotalQuantity(productId: string): Promise<number> {
    const result = await this.prisma.stockItem.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });
    
    return Number(result._sum.quantity || 0);
  }

  /**
   * Check if there's enough stock for a product
   */
  async hasEnoughStock(productId: string, requiredQuantity: number): Promise<boolean> {
    const totalQuantity = await this.getProductTotalQuantity(productId);
    return totalQuantity >= requiredQuantity;
  }

  /**
   * Create a stock transaction
   */
  async createStockTransaction(data: Prisma.StockTransactionCreateInput) {
    const transaction = await this.prisma.stockTransaction.create({
      data,
      include: { stockItem: true, product: true },
    });

    // Update the stock item quantity
    await this.prisma.stockItem.update({
      where: { id: data.stockItem.connect.id },
      data: {
        quantity: {
          increment: Number(data.quantity),
        },
      },
    });

    return transaction;
  }

  /**
   * Get all stock transactions with optional filtering
   */
  async findAllStockTransactions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StockTransactionWhereInput;
    orderBy?: Prisma.StockTransactionOrderByWithRelationInput;
    include?: Prisma.StockTransactionInclude;
  }) {
    const { skip, take, where, orderBy, include } = params;
    return this.prisma.stockTransaction.findMany({
      skip,
      take,
      where,
      orderBy,
      include: include || { stockItem: true, product: true },
    });
  }

  /**
   * Get a single stock transaction by ID
   */
  async findStockTransactionById(id: string, include?: Prisma.StockTransactionInclude) {
    const transaction = await this.prisma.stockTransaction.findUnique({
      where: { id },
      include: include || { stockItem: true, product: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Stock transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Create a stock count
   */
  async createStockCount(data: {
    notes?: string;
    items: Array<{
      productId: string;
      expectedQuantity: number;
      actualQuantity: number;
      notes?: string;
    }>;
  }) {
    const { notes, items } = data;

    return this.prisma.$transaction(async (prisma) => {
      // Create the stock count
      const stockCount = await prisma.stockCount.create({
        data: {
          notes,
          status: 'DRAFT',
        },
      });

      // Create stock count items
      const stockCountItems = await Promise.all(
        items.map(async (item) => {
          const { productId, expectedQuantity, actualQuantity, notes: itemNotes } = item;
          const difference = actualQuantity - expectedQuantity;

          return prisma.stockCountItem.create({
            data: {
              stockCount: { connect: { id: stockCount.id } },
              product: { connect: { id: productId } },
              expectedQuantity,
              actualQuantity,
              difference,
              notes: itemNotes,
            },
          });
        })
      );

      return { stockCount, items: stockCountItems };
    });
  }

  /**
   * Complete a stock count and adjust inventory if needed
   */
  async completeStockCount(stockCountId: string, adjustInventory: boolean = false) {
    return this.prisma.$transaction(async (prisma) => {
      // Get the stock count
      const stockCount = await prisma.stockCount.findUnique({
        where: { id: stockCountId },
        include: { items: { include: { product: true } } },
      });

      if (!stockCount) {
        throw new NotFoundException(`Stock count with ID ${stockCountId} not found`);
      }

      if (stockCount.status === 'COMPLETED') {
        throw new BadRequestException('Stock count is already completed');
      }

      // If adjusting inventory, create transactions for each item with a difference
      if (adjustInventory) {
        for (const item of stockCount.items) {
          if (item.difference !== 0) {
            // Find a stock item for this product
            const stockItem = await prisma.stockItem.findFirst({
              where: { productId: item.productId },
            });

            if (!stockItem) {
              throw new NotFoundException(`No stock item found for product ${item.product.name}`);
            }

            // Create a stock transaction for the adjustment
            await prisma.stockTransaction.create({
              data: {
                stockItem: { connect: { id: stockItem.id } },
                product: { connect: { id: item.productId } },
                quantity: item.difference,
                type: 'ADJUSTMENT',
                referenceType: 'STOCK_COUNT',
                reference: stockCountId,
                notes: `Adjustment from stock count ${stockCountId}`,
              },
            });

            // Update the stock item quantity
            await prisma.stockItem.update({
              where: { id: stockItem.id },
              data: {
                quantity: {
                  increment: item.difference,
                },
              },
            });
          }
        }
      }

      // Update the stock count status
      return prisma.stockCount.update({
        where: { id: stockCountId },
        data: { status: 'COMPLETED' },
        include: { items: true },
      });
    });
  }

  /**
   * Record stock wastage
   */
  async recordWastage(data: {
    productId: string;
    quantity: number;
    reason?: string;
    date?: Date;
  }) {
    const { productId, quantity, reason, date } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Wastage quantity must be positive');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Create wastage record
      const wastage = await prisma.stockWastage.create({
        data: {
          product: { connect: { id: productId } },
          quantity,
          reason,
          date: date || new Date(),
        },
        include: { product: true },
      });

      // Find a stock item for this product
      const stockItem = await prisma.stockItem.findFirst({
        where: { productId },
      });

      if (!stockItem) {
        throw new NotFoundException(`No stock item found for product ID ${productId}`);
      }

      // Create a stock transaction for the wastage
      await prisma.stockTransaction.create({
        data: {
          stockItem: { connect: { id: stockItem.id } },
          product: { connect: { id: productId } },
          quantity: -quantity, // Negative for reduction
          type: 'WASTAGE',
          referenceType: 'WASTAGE',
          reference: wastage.id,
          notes: reason || 'Stock wastage',
        },
      });

      // Update the stock item quantity
      await prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      return wastage;
    });
  }

  /**
   * Get low stock items (below minimum stock level)
   */
  async getLowStockItems() {
    // This query finds products where the total quantity across all stock items
    // is less than the minimum stock level defined for the product
    const lowStockProducts = await this.prisma.$queryRaw`
      SELECT 
        p.id, 
        p.name, 
        p.sku, 
        p."minStockLevel", 
        COALESCE(SUM(s.quantity), 0) as "totalQuantity"
      FROM 
        "Product" p
      LEFT JOIN 
        "StockItem" s ON p.id = s."productId"
      GROUP BY 
        p.id, p.name, p.sku, p."minStockLevel"
      HAVING 
        p."minStockLevel" IS NOT NULL 
        AND COALESCE(SUM(s.quantity), 0) < p."minStockLevel"
      ORDER BY 
        (p."minStockLevel" - COALESCE(SUM(s.quantity), 0)) DESC
    `;

    return lowStockProducts;
  }

  /**
   * Transfer stock between locations
   */
  async transferStock(data: {
    fromStockItemId: string;
    toStockItemId?: string;
    productId: string;
    quantity: number;
    newLocation?: string;
    notes?: string;
  }) {
    const { fromStockItemId, toStockItemId, productId, quantity, newLocation, notes } = data;

    if (quantity <= 0) {
      throw new BadRequestException('Transfer quantity must be positive');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Check if source stock item exists and has enough quantity
      const fromStockItem = await prisma.stockItem.findUnique({
        where: { id: fromStockItemId },
      });

      if (!fromStockItem) {
        throw new NotFoundException(`Source stock item with ID ${fromStockItemId} not found`);
      }

      if (fromStockItem.quantity < quantity) {
        throw new BadRequestException(`Not enough stock available for transfer. Available: ${fromStockItem.quantity}, Requested: ${quantity}`);
      }

      let toStockItem;

      // If toStockItemId is provided, use that as destination
      if (toStockItemId) {
        toStockItem = await prisma.stockItem.findUnique({
          where: { id: toStockItemId },
        });

        if (!toStockItem) {
          throw new NotFoundException(`Destination stock item with ID ${toStockItemId} not found`);
        }

        if (toStockItem.productId !== productId) {
          throw new BadRequestException('Source and destination stock items must be for the same product');
        }
      } 
      // Otherwise, create a new stock item at the new location
      else if (newLocation) {
        toStockItem = await prisma.stockItem.create({
          data: {
            product: { connect: { id: productId } },
            quantity: 0, // Will be incremented below
            location: newLocation,
            batchNumber: fromStockItem.batchNumber, // Maintain same batch
          },
        });
      } else {
        throw new BadRequestException('Either destination stock item ID or new location must be provided');
      }

      // Create outgoing transaction
      await prisma.stockTransaction.create({
        data: {
          stockItem: { connect: { id: fromStockItemId } },
          product: { connect: { id: productId } },
          quantity: -quantity, // Negative for outgoing
          type: 'TRANSFER',
          notes: notes || `Transfer to ${toStockItem.location || toStockItem.id}`,
        },
      });

      // Create incoming transaction
      await prisma.stockTransaction.create({
        data: {
          stockItem: { connect: { id: toStockItem.id } },
          product: { connect: { id: productId } },
          quantity: quantity, // Positive for incoming
          type: 'TRANSFER',
          notes: notes || `Transfer from ${fromStockItem.location || fromStockItem.id}`,
        },
      });

      // Update source stock item
      await prisma.stockItem.update({
        where: { id: fromStockItemId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      // Update destination stock item
      await prisma.stockItem.update({
        where: { id: toStockItem.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      return {
        fromStockItem: await prisma.stockItem.findUnique({
          where: { id: fromStockItemId },
          include: { product: true },
        }),
        toStockItem: await prisma.stockItem.findUnique({
          where: { id: toStockItem.id },
          include: { product: true },
        }),
        quantity,
      };
    });
  }

  /**
   * Process stock changes for production
   */
  async processProductionStock(productionOrderId: string, items: Array<{
    productId: string;
    quantity: number;
    isOutput: boolean;
  }>) {
    return this.prisma.$transaction(async (prisma) => {
      for (const item of items) {
        const { productId, quantity, isOutput } = item;
        
        // Find a stock item for this product
        const stockItem = await prisma.stockItem.findFirst({
          where: { productId },
        });

        if (!stockItem) {
          throw new NotFoundException(`No stock item found for product ID ${productId}`);
        }

        // Create a stock transaction
        await prisma.stockTransaction.create({
          data: {
            stockItem: { connect: { id: stockItem.id } },
            product: { connect: { id: productId } },
            quantity: isOutput ? quantity : -quantity, // Positive for output, negative for input
            type: isOutput ? 'PRODUCTION_IN' : 'PRODUCTION_OUT',
            referenceType: 'PRODUCTION',
            reference: productionOrderId,
            notes: isOutput ? 'Production output' : 'Production input',
          },
        });

        // Update the stock item quantity
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: {
              [isOutput ? 'increment' : 'decrement']: quantity,
            },
          },
        });
      }

      return { success: true, productionOrderId };
    });
  }

  /**
   * Process stock changes for sales
   */
  async processSaleStock(saleId: string, items: Array<{
    productId: string;
    quantity: number;
  }>) {
    return this.prisma.$transaction(async (prisma) => {
      for (const item of items) {
        const { productId, quantity } = item;
        
        // Find a stock item for this product
        const stockItem = await prisma.stockItem.findFirst({
          where: { productId },
        });

        if (!stockItem) {
          throw new NotFoundException(`No stock item found for product ID ${productId}`);
        }

        if (stockItem.quantity < quantity) {
          throw new BadRequestException(`Not enough stock available for product ID ${productId}. Available: ${stockItem.quantity}, Requested: ${quantity}`);
        }

        // Create a stock transaction
        await prisma.stockTransaction.create({
          data: {
            stockItem: { connect: { id: stockItem.id } },
            product: { connect: { id: productId } },
            quantity: -quantity, // Negative for sales
            type: 'SALE',
            referenceType: 'SALE',
            reference: saleId,
            notes: 'Sale deduction',
          },
        });

        // Update the stock item quantity
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }

      return { success: true, saleId };
    });
  }

  /**
   * Process stock changes for purchases
   */
  async processPurchaseStock(purchaseId: string, items: Array<{
    productId: string;
    quantity: number;
    location?: string;
    batchNumber?: string;
  }>) {
    return this.prisma.$transaction(async (prisma) => {
      for (const item of items) {
        const { productId, quantity, location, batchNumber } = item;
        
        // Find an existing stock item for this product and location/batch
        let stockItem = await prisma.stockItem.findFirst({
          where: {
            productId,
            ...(location ? { location } : {}),
            ...(batchNumber ? { batchNumber } : {}),
          },
        });

        // If no matching stock item exists, create a new one
        if (!stockItem) {
          stockItem = await prisma.stockItem.create({
            data: {
              product: { connect: { id: productId } },
              quantity: 0, // Will be incremented below
              location: location || 'Warehouse',
              batchNumber: batchNumber || `BATCH-${new Date().toISOString().slice(0, 10)}`,
            },
          });
        }

        // Create a stock transaction
        await prisma.stockTransaction.create({
          data: {
            stockItem: { connect: { id: stockItem.id } },
            product: { connect: { id: productId } },
            quantity: quantity, // Positive for purchases
            type: 'PURCHASE',
            referenceType: 'PURCHASE',
            reference: purchaseId,
            notes: 'Purchase receipt',
          },
        });

        // Update the stock item quantity
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      }

      return { success: true, purchaseId };
    });
  }
}
