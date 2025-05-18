import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { StockItemType } from '../types/stock.types';

export class CreateStockItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumQuantity?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsNotEmpty()
  @IsEnum(StockItemType)
  type: StockItemType;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  bomId?: string;
}
