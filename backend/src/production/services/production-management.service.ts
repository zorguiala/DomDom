import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../../stock/stock.service';
import { Prisma, ProductionStatus } from '@prisma/client';

@Injectable()
export class ProductionManagementService {
  private readonly logger = new Logger(ProductionManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stockService: StockService,
  ) {}

  /**
   * Create a new production order
   */
  async createProductionOrder(data: {
    bomId: string;
    quantity: number;
    startDate?: Date;
    notes?: string;
  }) {
    const { bomId, quantity, startDate, notes } = data;

    // Validate BOM exists
    const bom = await this.prisma.bOM.findUnique({
      where: { id: bomId },
      include: {
        finalProduct: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!bom) {
      throw new NotFoundException(`BOM with ID ${bomId} not found`);
    }

    if (quantity <= 0) {
      throw new BadRequestException('Production quantity must be greater than 0');
    }

    // Check if there's enough stock for all materials
    await this.validateMaterialAvailability(bom, quantity);

    // Create production order with items
    return this.prisma.productionOrder.create({
      data: {
        bom: { connect: { id: bomId } },
        quantity,
        status: ProductionStatus.PLANNED,
        startDate,
        notes,
        items: {
          create: [
            // Input items (raw materials)
            ...bom.items.map(item => ({
              product: { connect: { id: item.productId } },
              plannedQuantity: Number(item.quantity) * quantity,
              unit: item.unit,
              isOutput: false,
            })),
            // Output item (finished product)
            {
              product: { connect: { id: bom.finalProductId } },
              plannedQuantity: quantity,
              unit: 'unit', // Default unit, could be customized
              isOutput: true,
            },
          ],
        },
      },
      include: {
        bom: {
          include: {
            finalProduct: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Start a production order
   */
  async startProduction(productionOrderId: string) {
    const productionOrder = await this.prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
    });

    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    if (productionOrder.status !== ProductionStatus.PLANNED) {
      throw new BadRequestException(`Cannot start production order with status ${productionOrder.status}`);
    }

    return this.prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: {
        status: ProductionStatus.IN_PROGRESS,
        startDate: new Date(),
      },
      include: {
        bom: {
          include: {
            finalProduct: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Complete a production order
   * This is where materials are consumed and finished products are created
   */
  async completeProduction(productionOrderId: string, data: {
    employeeId?: string;
    actualQuantities?: Array<{
      productionOrderItemId: string;
      actualQuantity: number;
    }>;
    notes?: string;
  }) {
    const { employeeId, actualQuantities, notes } = data;

    // Get production order with items
    const productionOrder = await this.prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        bom: {
          include: {
            finalProduct: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    if (productionOrder.status === ProductionStatus.COMPLETED) {
      throw new BadRequestException('Production order is already completed');
    }

    if (productionOrder.status === ProductionStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled production order');
    }

    // Process actual quantities if provided
    if (actualQuantities && actualQuantities.length > 0) {
      for (const item of actualQuantities) {
        const orderItem = productionOrder.items.find(oi => oi.id === item.productionOrderItemId);
        
        if (!orderItem) {
          throw new NotFoundException(`Production order item with ID ${item.productionOrderItemId} not found`);
        }

        if (item.actualQuantity < 0) {
          throw new BadRequestException('Actual quantity cannot be negative');
        }
      }
    }

    // Default to planned quantities if actual quantities not provided
    const itemsToProcess = productionOrder.items.map(item => {
      const actualItem = actualQuantities?.find(aq => aq.productionOrderItemId === item.id);
      return {
        ...item,
        actualQuantity: actualItem ? actualItem.actualQuantity : Number(item.plannedQuantity),
      };
    });

    // Check if there's enough stock for all input materials
    const inputItems = itemsToProcess.filter(item => !item.isOutput);
    for (const item of inputItems) {
      const hasEnough = await this.stockService.hasEnoughStock(
        item.productId, 
        item.actualQuantity || Number(item.plannedQuantity)
      );
      
      if (!hasEnough) {
        throw new BadRequestException(
          `Not enough stock for product ${item.product.name} (ID: ${item.productId})`
        );
      }
    }

    // Process the production in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // 1. Update production order items with actual quantities
      if (actualQuantities && actualQuantities.length > 0) {
        for (const item of actualQuantities) {
          await prisma.productionOrderItem.update({
            where: { id: item.productionOrderItemId },
            data: { actualQuantity: item.actualQuantity },
          });
        }
      } else {
        // Set actual quantities to planned quantities if not provided
        for (const item of productionOrder.items) {
          await prisma.productionOrderItem.update({
            where: { id: item.id },
            data: { actualQuantity: item.plannedQuantity },
          });
        }
      }

      // 2. Create production record
      await prisma.productionRecord.create({
        data: {
          productionOrder: { connect: { id: productionOrderId } },
          ...(employeeId && { employee: { connect: { id: employeeId } } }),
          quantity: productionOrder.quantity,
          notes,
        },
      });

      // 3. Update production order status
      await prisma.productionOrder.update({
        where: { id: productionOrderId },
        data: {
          status: ProductionStatus.COMPLETED,
          endDate: new Date(),
        },
      });

      // 4. Process stock changes
      // Prepare stock items for processing
      const stockItems = itemsToProcess.map(item => ({
        productId: item.productId,
        quantity: item.actualQuantity || Number(item.plannedQuantity),
        isOutput: item.isOutput,
      }));

      // Use stock service to process the stock changes
      await this.stockService.processProductionStock(productionOrderId, stockItems);

      // Get the updated production order
      return prisma.productionOrder.findUnique({
        where: { id: productionOrderId },
        include: {
          bom: {
            include: {
              finalProduct: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  /**
   * Cancel a production order
   */
  async cancelProduction(productionOrderId: string, reason?: string) {
    const productionOrder = await this.prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
    });

    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    if (productionOrder.status === ProductionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed production order');
    }

    if (productionOrder.status === ProductionStatus.CANCELLED) {
      throw new BadRequestException('Production order is already cancelled');
    }

    return this.prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: {
        status: ProductionStatus.CANCELLED,
        notes: reason ? `${productionOrder.notes || ''} Cancelled: ${reason}`.trim() : productionOrder.notes,
      },
      include: {
        bom: {
          include: {
            finalProduct: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Validate if there's enough stock for all materials in a BOM
   */
  private async validateMaterialAvailability(bom: any, quantity: number) {
    for (const item of bom.items) {
      const requiredQuantity = Number(item.quantity) * quantity;
      const hasEnough = await this.stockService.hasEnoughStock(item.productId, requiredQuantity);
      
      if (!hasEnough) {
        throw new BadRequestException(
          `Not enough stock for material ${item.product.name} (ID: ${item.productId}). ` +
          `Required: ${requiredQuantity}`
        );
      }
    }
  }

  /**
   * Get production order details
   */
  async getProductionOrderDetails(productionOrderId: string) {
    const productionOrder = await this.prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        bom: {
          include: {
            finalProduct: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        records: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!productionOrder) {
      throw new NotFoundException(`Production order with ID ${productionOrderId} not found`);
    }

    return productionOrder;
  }

  /**
   * List production orders with filtering
   */
  async listProductionOrders(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductionOrderWhereInput;
    orderBy?: Prisma.ProductionOrderOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    const [items, count] = await Promise.all([
      this.prisma.productionOrder.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          bom: {
            include: {
              finalProduct: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.productionOrder.count({ where }),
    ]);

    return {
      items,
      count,
      skip: skip || 0,
      take: take || count,
    };
  }

  /**
   * Get production statistics
   */
  async getProductionStatistics(params: {
    startDate?: Date;
    endDate?: Date;
    productId?: string;
  }) {
    const { startDate, endDate, productId } = params;
    
    const whereClause: Prisma.ProductionOrderWhereInput = {
      status: ProductionStatus.COMPLETED,
    };
    
    if (startDate || endDate) {
      whereClause.endDate = {};
      if (startDate) whereClause.endDate.gte = startDate;
      if (endDate) whereClause.endDate.lte = endDate;
    }
    
    if (productId) {
      whereClause.bom = {
        finalProductId: productId,
      };
    }

    // Get total completed production orders
    const totalOrders = await this.prisma.productionOrder.count({
      where: whereClause,
    });

    // Get total produced quantity
    const totalQuantityResult = await this.prisma.productionOrder.aggregate({
      where: whereClause,
      _sum: {
        quantity: true,
      },
    });
    
    const totalQuantity = totalQuantityResult._sum.quantity || 0;

    // Get production by product
    const productionByProduct = await this.prisma.productionOrder.groupBy({
      by: ['bomId'],
      where: whereClause,
      _sum: {
        quantity: true,
      },
      _count: true,
    });

    // Get BOM details for each group
    const bomIds = productionByProduct.map(item => item.bomId);
    const boms = await this.prisma.bOM.findMany({
      where: {
        id: {
          in: bomIds,
        },
      },
      include: {
        finalProduct: true,
      },
    });

    // Combine BOM details with production data
    const productionByProductWithDetails = productionByProduct.map(item => {
      const bom = boms.find(b => b.id === item.bomId);
      return {
        bomId: item.bomId,
        productId: bom?.finalProductId,
        productName: bom?.finalProduct.name || 'Unknown Product',
        quantity: item._sum.quantity,
        count: item._count,
      };
    });

    // Get production trend (by day, week, or month depending on date range)
    let trendGroupBy = 'day';
    if (startDate && endDate) {
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 60) {
        trendGroupBy = 'month';
      } else if (diffDays > 14) {
        trendGroupBy = 'week';
      }
    }

    // This would be better with raw SQL for proper date grouping
    // For now, we'll just get all completed orders and group them in memory
    const completedOrders = await this.prisma.productionOrder.findMany({
      where: whereClause,
      select: {
        id: true,
        endDate: true,
        quantity: true,
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    // Group by day/week/month
    const trend = this.groupProductionByTime(completedOrders, trendGroupBy);

    return {
      totalOrders,
      totalQuantity,
      productionByProduct: productionByProductWithDetails,
      trend,
    };
  }

  /**
   * Group production orders by time period
   */
  private groupProductionByTime(orders: Array<{id: string, endDate: Date, quantity: any}>, groupBy: 'day' | 'week' | 'month') {
    const result = {};
    
    for (const order of orders) {
      const date = new Date(order.endDate);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else { // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!result[key]) {
        result[key] = {
          period: key,
          count: 0,
          quantity: 0,
        };
      }
      
      result[key].count += 1;
      result[key].quantity += Number(order.quantity);
    }
    
    return Object.values(result);
  }
}
