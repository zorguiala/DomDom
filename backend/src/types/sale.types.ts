import { ApiProperty } from '@nestjs/swagger';

export enum SaleStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export interface SaleItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
