import { ApiProperty } from '@nestjs/swagger';

export enum SaleType {
  DIRECT = 'direct',
  COMMERCIAL = 'commercial',
  ONLINE = 'online',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT = 'credit',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other',
}

export class SaleItemDto {
  @ApiProperty() productId!: string;
  @ApiProperty() productName!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() unitPrice!: number;
  @ApiProperty() total!: number;
}

export interface SaleDto {
  id: string;
  date: Date;
  customerName: string;
  status: SaleStatus;
  total: number;
  items: SaleItemDto[];
}

export class CreateSaleItemDto {
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
}

export class CreateSaleDto {
  @ApiProperty() customerName: string;
  @ApiProperty({ type: [CreateSaleItemDto] }) items: CreateSaleItemDto[];
}

export class UpdateSaleItemDto {
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPrice: number;
}

export class UpdateSaleDto {
  @ApiProperty({ required: false }) customerName?: string;
  @ApiProperty({ type: [UpdateSaleItemDto], required: false }) items?: UpdateSaleItemDto[];
  @ApiProperty({ required: false }) status?: SaleStatus;
  @ApiProperty({ required: false }) notes?: string;
  @ApiProperty({ required: false }) discount?: number;
  @ApiProperty({ required: false }) paymentMethod?: string;
}

export class SaleReportFilterDto {
  @ApiProperty({ required: false }) startDate?: string;
  @ApiProperty({ required: false }) endDate?: string;
  @ApiProperty({ required: false }) productId?: string;
  @ApiProperty({ required: false }) customerName?: string;
}

export class SaleReportItemDto {
  @ApiProperty() date: Date;
  @ApiProperty() customerName: string;
  @ApiProperty() productName: string;
  @ApiProperty() quantity: number;
  @ApiProperty() total: number;
}

export class SaleReportDto {
  @ApiProperty({ type: [SaleReportItemDto] }) items: SaleReportItemDto[];
  @ApiProperty() totalSales: number;
  @ApiProperty() totalRevenue: number;
}
