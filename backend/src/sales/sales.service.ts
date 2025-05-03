import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import {
  CreateSaleDto,
  SaleReportFilterDto,
  SaleReportDto,
  SaleReportItemDto,
} from '../types/sale.types';
import { UpdateSaleDto } from './dto/sale.dto';
import { SaleType, SaleStatus, PaymentMethod } from '../types/sale.types';
import { Between } from 'typeorm';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async createSale(dto: CreateSaleDto): Promise<Sale> {
    if (!dto.items || dto.items.length === 0) throw new BadRequestException('Sale must have items');
    let total = 0;
    const items: SaleItem[] = [];

    for (const itemDto of dto.items) {
      const productId = Number(itemDto.productId);
      if (isNaN(productId)) {
        throw new BadRequestException(`Invalid product ID: ${itemDto.productId}`);
      }

      const product = await this.productRepo.findOne({
        where: { id: String(productId) },
        select: ['id', 'name', 'price'],
      });

      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      const quantity = Number(itemDto.quantity);
      const unitPrice = Number(itemDto.unitPrice);

      if (isNaN(quantity) || isNaN(unitPrice)) {
        throw new BadRequestException('Invalid quantity or unit price');
      }

      const itemTotal = quantity * unitPrice;
      total += itemTotal;

      items.push(
        this.saleItemRepo.create({
          product: product,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: itemTotal,
          sale: undefined, // Will be set when sale is created
        })
      );
    }

    const sale = this.saleRepo.create({
      status: SaleStatus.COMPLETED,
      totalAmount: total,
      finalAmount: total,
      items,
    });

    return this.saleRepo.save(sale);
  }

  async listSales(query: { page?: number; limit?: number; search?: string; sort?: string }) {
    const take = query.limit ? Number(query.limit) : 20;
    const skip = query.page ? (Number(query.page) - 1) * take : 0;
    const qb = this.saleRepo
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'item')
      .leftJoinAndSelect('item.product', 'product');
    if (query.search) {
      qb.where('sale.invoiceNumber ILIKE :search', { search: `%${query.search}%` });
    }
    if (query.sort) {
      qb.orderBy('sale.createdAt', query.sort.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
    } else {
      qb.orderBy('sale.createdAt', 'DESC');
    }
    qb.skip(skip).take(take);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: query.page || 1, limit: take };
  }

  async getSale(id: string) {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async updateSale(id: string, dto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });
    if (!sale) throw new NotFoundException('Sale not found');

    if (dto.customerId) {
      const customer = await this.userRepo.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      sale.customer = customer;
    }

    // Handle enum values with type safety
    if (dto.status && this.isValidSaleStatus(dto.status)) {
      sale.status = dto.status;
    }
    if (dto.type && this.isValidSaleType(dto.type)) {
      sale.type = dto.type;
    }
    if (dto.paymentMethod && this.isValidPaymentMethod(dto.paymentMethod)) {
      sale.paymentMethod = dto.paymentMethod;
    }

    // Handle scalar values
    if (dto.notes !== undefined) sale.notes = dto.notes;
    if (typeof dto.discount === 'number') sale.discount = dto.discount;
    if (typeof dto.totalAmount === 'number') sale.totalAmount = dto.totalAmount;

    // Update items if provided
    if (dto.items?.length) {
      await this.saleItemRepo.delete({ sale: { id: sale.id } });
      const newItems: SaleItem[] = [];
      let total = 0;

      for (const itemDto of dto.items) {
        const product = await this.productRepo.findOne({
          where: { id: String(itemDto.productId) },
          select: ['id', 'name', 'price'],
        });

        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productId} not found`);
        }

        const quantity = Number(itemDto.quantity);
        const unitPrice = Number(itemDto.unitPrice);
        if (isNaN(quantity) || isNaN(unitPrice)) {
          throw new BadRequestException('Invalid quantity or unit price');
        }

        const itemTotal = quantity * unitPrice;
        total += itemTotal;

        newItems.push(
          this.saleItemRepo.create({
            product: product,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: itemTotal,
            sale,
          })
        );
      }

      sale.items = await this.saleItemRepo.save(newItems);
      sale.totalAmount = total;
      sale.finalAmount = total - (sale.discount || 0);
    }

    return this.saleRepo.save(sale);
  }

  // Helper methods for type safety
  private isValidSaleStatus(status: unknown): status is SaleStatus {
    return typeof status === 'string' && Object.values<string>(SaleStatus).includes(status);
  }

  private isValidSaleType(type: unknown): type is SaleType {
    return typeof type === 'string' && Object.values<string>(SaleType).includes(type);
  }

  private isValidPaymentMethod(method: unknown): method is PaymentMethod {
    return typeof method === 'string' && Object.values<string>(PaymentMethod).includes(method);
  }

  async deleteSale(id: string): Promise<{ success: boolean }> {
    const sale = await this.saleRepo.findOne({ where: { id } });
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    await this.saleRepo.remove(sale);
    return { success: true };
  }

  async getDailySales(startDate: Date, endDate: Date) {
    const sales = await this.saleRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['items', 'items.product', 'agent'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate totals
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    
    // Get sales by hour
    const salesByHour = Array(24).fill(0);
    sales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      salesByHour[hour]++;
    });

    // Get sales by payment method
    const salesByPaymentMethod = {
      [PaymentMethod.CASH]: 0,
      [PaymentMethod.CARD]: 0,
      [PaymentMethod.BANK_TRANSFER]: 0,
      [PaymentMethod.OTHER]: 0,
    };

    sales.forEach(sale => {
      if (sale.paymentMethod) {
        salesByPaymentMethod[sale.paymentMethod]++;
      } else {
        salesByPaymentMethod[PaymentMethod.OTHER]++;
      }
    });

    // Get top selling products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.id;
        const productName = item.product.name;
        const quantity = item.quantity || 0;
        const revenue = (item.unitPrice || 0) * quantity;
        
        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, { name: productName, quantity, revenue });
        }
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      date: startDate.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalItems,
      salesByHour,
      salesByPaymentMethod,
      topProducts,
      recentSales: sales.slice(0, 10).map(sale => ({
        id: sale.id,
        time: sale.createdAt,
        total: sale.totalAmount,
        customerName: (sale as any).agent?.name || 'Walk-in Customer', 
        items: sale.items.length,
      })),
    };
  }

  async getSalesOverview(startDate: Date, endDate: Date) {
    // Get all sales in date range
    const sales = await this.saleRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['items', 'items.product'],
    });

    // Calculate days in range for averages
    const daysInRange = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    
    // Calculate average daily revenue
    const averageDailyRevenue = totalRevenue / daysInRange;
    
    // Calculate total sales count
    const totalSalesCount = sales.length;
    
    // Calculate average order value
    const averageOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
    
    // Get sales trend data by day
    const salesByDay = new Map<string, { date: string; count: number; revenue: number }>();
    
    // Initialize with all days in range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      salesByDay.set(dateStr, { date: dateStr, count: 0, revenue: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Populate with actual sales data
    sales.forEach(sale => {
      const dateStr = new Date(sale.createdAt).toISOString().split('T')[0];
      const dayData = salesByDay.get(dateStr);
      
      if (dayData) {
        dayData.count++;
        dayData.revenue += sale.totalAmount || 0;
      }
    });
    
    // Get top selling products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.id;
        const productName = item.product.name;
        const quantity = item.quantity || 0;
        const revenue = (item.unitPrice || 0) * quantity;
        
        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, { name: productName, quantity, revenue });
        }
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysInRange,
      },
      salesMetrics: {
        totalRevenue,
        averageDailyRevenue,
        totalSalesCount,
        averageOrderValue,
      },
      salesTrend: Array.from(salesByDay.values()).sort((a, b) => a.date.localeCompare(b.date)),
      topProducts,
    };
  }

  async getSalesReport(filter: SaleReportFilterDto): Promise<SaleReportDto> {
    const qb = this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.sale', 'sale')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('sale.customer', 'customer');
    if (filter.startDate)
      qb.andWhere('sale.createdAt >= :startDate', { startDate: filter.startDate });
    if (filter.endDate) qb.andWhere('sale.createdAt <= :endDate', { endDate: filter.endDate });
    if (filter.productId) qb.andWhere('product.id = :productId', { productId: filter.productId });
    if (filter.customerName)
      qb.andWhere(`concat(customer.firstName, ' ', customer.lastName) ILIKE :customerName`, {
        customerName: `%${filter.customerName}%`,
      });
    const items = await qb.getMany();
    const reportItems: SaleReportItemDto[] = items.map((item) => ({
      date: item.sale.createdAt,
      customerName: item.sale.customer
        ? `${item.sale.customer.firstName} ${item.sale.customer.lastName}`
        : '',
      productName: item.product ? item.product.name : '',
      quantity: Number(item.quantity),
      total: Number(item.totalPrice),
    }));
    const totalSales = reportItems.length;
    const totalRevenue = reportItems.reduce((sum, i) => sum + i.total, 0);
    return { items: reportItems, totalSales, totalRevenue };
  }
}
