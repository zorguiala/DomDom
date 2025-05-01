import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleStatus } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import {
  CreateSaleDto,
  SaleReportFilterDto,
  SaleReportDto,
  SaleReportItemDto,
} from '../types/sale.types';

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
      const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
      if (!product) throw new NotFoundException(`Product ${itemDto.productId} not found`);
      const itemTotal = itemDto.quantity * itemDto.unitPrice;
      total += itemTotal;
      items.push(
        this.saleItemRepo.create({
          product,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice: itemTotal,
          finalPrice: itemTotal,
          discount: 0,
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
