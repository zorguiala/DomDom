import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StockService } from '../stock/stock.service';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stockService: StockService,
  ) {}

  /**
   * Get all purchases with optional filtering
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PurchaseWhereUniqueInput;
    where?: Prisma.PurchaseWhereInput;
    orderBy?: Prisma.PurchaseOrderByWithRelationInput;
    include?: Prisma.PurchaseInclude;
  }) {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.purchase.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: include || { items: { include: { product: true } } },
    });
  }

  /**
   * Get a single purchase by ID
   */
  async findOne(id: string, include?: Prisma.PurchaseInclude) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: include || { items: { include: { product: true } } },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  /**
   * Create a new purchase
   */
  async create(data: {
    supplierName: string;
    supplierContact?: string;
    referenceNumber?: string;
    date?: Date;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }) {
    const { supplierName, supplierContact, referenceNumber, date, notes, items } = data;

    // Calculate totals
    let totalAmount = 0;
    const purchaseItems = items.map(item => {
      const total = item.quantity * item.price;
      totalAmount += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total,
      };
    });

    return this.prisma.purchase.create({
      data: {
        supplierName,
        supplierContact,
        referenceNumber,
        date: date || new Date(),
        status: 'DRAFT',
        totalAmount,
        paymentStatus: 'PENDING',
        notes,
        items: {
          create: purchaseItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing purchase
   */
  async update(id: string, data: {
    supplierName?: string;
    supplierContact?: string;
    referenceNumber?: string;
    date?: Date;
    status?: Prisma.PurchaseStatus;
    paymentStatus?: Prisma.PaymentStatus;
    paymentMethod?: Prisma.PaymentMethod;
    notes?: string;
  }) {
    try {
      // Check if purchase exists and is not already received
      const existingPurchase = await this.prisma.purchase.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingPurchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      if (existingPurchase.status === 'RECEIVED' && data.status && data.status !== 'RECEIVED') {
        throw new BadRequestException('Cannot change status of a fully received purchase');
      }

      return this.prisma.purchase.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete a purchase
   */
  async remove(id: string) {
    try {
      // Check if purchase exists and is not already received
      const existingPurchase = await this.prisma.purchase.findUnique({
        where: { id },
      });

      if (!existingPurchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      if (existingPurchase.status === 'RECEIVED' || existingPurchase.status === 'PARTIALLY_RECEIVED') {
        throw new BadRequestException('Cannot delete a purchase that has been received');
      }

      // First delete related purchase items
      await this.prisma.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      // Then delete the purchase
      return this.prisma.purchase.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Update purchase items
   */
  async updateItems(purchaseId: string, items: Array<{
    id?: string;
    productId: string;
    quantity: number;
    price: number;
  }>) {
    try {
      // Check if purchase exists and is not already received
      const existingPurchase = await this.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true },
      });

      if (!existingPurchase) {
        throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
      }

      if (existingPurchase.status === 'RECEIVED') {
        throw new BadRequestException('Cannot update items of a fully received purchase');
      }

      // Get existing item IDs for deletion check
      const existingItemIds = existingPurchase.items.map(item => item.id);
      const updatedItemIds = items.filter(item => item.id).map(item => item.id);
      
      // Items to delete (existing but not in updated list)
      const itemsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));

      return this.prisma.$transaction(async (prisma) => {
        // Delete removed items
        if (itemsToDelete.length > 0) {
          await prisma.purchaseItem.deleteMany({
            where: {
              id: { in: itemsToDelete },
            },
          });
        }

        // Update or create items
        for (const item of items) {
          const total = item.quantity * item.price;
          
          if (item.id) {
            // Update existing item
            await prisma.purchaseItem.update({
              where: { id: item.id },
              data: {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total,
              },
            });
          } else {
            // Create new item
            await prisma.purchaseItem.create({
              data: {
                purchase: { connect: { id: purchaseId } },
                product: { connect: { id: item.productId } },
                quantity: item.quantity,
                price: item.price,
                total,
              },
            });
          }
        }

        // Recalculate total amount
        const updatedItems = await prisma.purchaseItem.findMany({
          where: { purchaseId },
        });
        
        const totalAmount = updatedItems.reduce((sum, item) => sum + Number(item.total), 0);

        // Update purchase with new total
        return prisma.purchase.update({
          where: { id: purchaseId },
          data: { totalAmount },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
      }
      throw error;
    }
  }

  /**
   * Confirm a purchase (change status from DRAFT to ORDERED)
   */
  async confirmPurchase(id: string) {
    try {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!purchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      if (purchase.status !== 'DRAFT') {
        throw new BadRequestException(`Purchase is already ${purchase.status}`);
      }

      if (purchase.items.length === 0) {
        throw new BadRequestException('Cannot confirm a purchase with no items');
      }

      return this.prisma.purchase.update({
        where: { id },
        data: { status: 'ORDERED' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Receive items from a purchase
   */
  async receiveItems(purchaseId: string, items: Array<{
    purchaseItemId: string;
    receivedQuantity: number;
    location?: string;
    batchNumber?: string;
  }>) {
    try {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: { include: { product: true } } },
      });

      if (!purchase) {
        throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
      }

      if (purchase.status === 'DRAFT') {
        throw new BadRequestException('Cannot receive items for a draft purchase');
      }

      if (purchase.status === 'RECEIVED') {
        throw new BadRequestException('Purchase is already fully received');
      }

      // Validate items
      for (const item of items) {
        const purchaseItem = purchase.items.find(pi => pi.id === item.purchaseItemId);
        
        if (!purchaseItem) {
          throw new NotFoundException(`Purchase item with ID ${item.purchaseItemId} not found in this purchase`);
        }

        if (item.receivedQuantity <= 0) {
          throw new BadRequestException('Received quantity must be greater than 0');
        }

        if (item.receivedQuantity > purchaseItem.quantity) {
          throw new BadRequestException(`Cannot receive more than ordered quantity for item ${purchaseItem.product.name}`);
        }

        // If already partially received, check if new quantity exceeds remaining
        if (purchaseItem.receivedQuantity && 
            (Number(purchaseItem.receivedQuantity) + item.receivedQuantity > purchaseItem.quantity)) {
          throw new BadRequestException(
            `Total received quantity (${Number(purchaseItem.receivedQuantity) + item.receivedQuantity}) ` +
            `exceeds ordered quantity (${purchaseItem.quantity}) for item ${purchaseItem.product.name}`
          );
        }
      }

      return this.prisma.$transaction(async (prisma) => {
        // Update received quantities for each item
        for (const item of items) {
          const purchaseItem = purchase.items.find(pi => pi.id === item.purchaseItemId);
          
          // Update purchase item with received quantity
          await prisma.purchaseItem.update({
            where: { id: item.purchaseItemId },
            data: {
              receivedQuantity: {
                increment: item.receivedQuantity,
              },
            },
          });

          // Prepare stock update data
          const stockUpdateData = {
            productId: purchaseItem.productId,
            quantity: item.receivedQuantity,
            location: item.location,
            batchNumber: item.batchNumber,
          };

          // Update stock
          await this.stockService.processPurchaseStock(purchaseId, [stockUpdateData]);
        }

        // Check if all items are fully received
        const updatedPurchaseItems = await prisma.purchaseItem.findMany({
          where: { purchaseId },
        });

        const allItemsReceived = updatedPurchaseItems.every(item => 
          item.receivedQuantity && Number(item.receivedQuantity) >= Number(item.quantity)
        );

        const someItemsReceived = updatedPurchaseItems.some(item => 
          item.receivedQuantity && Number(item.receivedQuantity) > 0
        );

        // Update purchase status
        const newStatus = allItemsReceived ? 'RECEIVED' : 
                          someItemsReceived ? 'PARTIALLY_RECEIVED' : 
                          purchase.status;

        return prisma.purchase.update({
          where: { id: purchaseId },
          data: { status: newStatus },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });
    } catch (error) {
      this.logger.error(`Error receiving purchase items: ${error.message}`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
      }
      throw error;
    }
  }

  /**
   * Cancel a purchase
   */
  async cancelPurchase(id: string) {
    try {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id },
      });

      if (!purchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      if (purchase.status === 'RECEIVED') {
        throw new BadRequestException('Cannot cancel a fully received purchase');
      }

      if (purchase.status === 'PARTIALLY_RECEIVED') {
        throw new BadRequestException('Cannot cancel a partially received purchase');
      }

      return this.prisma.purchase.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Update payment information
   */
  async updatePayment(id: string, data: {
    paymentStatus: Prisma.PaymentStatus;
    paymentMethod?: Prisma.PaymentMethod;
  }) {
    try {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id },
      });

      if (!purchase) {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }

      return this.prisma.purchase.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Purchase with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Get purchase statistics
   */
  async getStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    supplierId?: string;
  }) {
    const { startDate, endDate, supplierId } = params;
    
    const whereClause: Prisma.PurchaseWhereInput = {};
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }
    
    if (supplierId) {
      whereClause.supplierName = supplierId;
    }

    // Get total purchases
    const totalPurchases = await this.prisma.purchase.count({
      where: whereClause,
    });

    // Get total amount
    const totalAmountResult = await this.prisma.purchase.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
    });
    
    const totalAmount = totalAmountResult._sum.totalAmount || 0;

    // Get status breakdown
    const statusBreakdown = await this.prisma.purchase.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    // Get payment status breakdown
    const paymentStatusBreakdown = await this.prisma.purchase.groupBy({
      by: ['paymentStatus'],
      where: whereClause,
      _count: true,
    });

    // Get top suppliers
    const topSuppliers = await this.prisma.purchase.groupBy({
      by: ['supplierName'],
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get top products
    const topProducts = await this.prisma.purchaseItem.groupBy({
      by: ['productId'],
      where: {
        purchase: whereClause,
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Combine product details with top products
    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Unknown Product',
        quantity: item._sum.quantity,
        total: item._sum.total,
      };
    });

    return {
      totalPurchases,
      totalAmount,
      statusBreakdown,
      paymentStatusBreakdown,
      topSuppliers,
      topProducts: topProductsWithDetails,
    };
  }
}
