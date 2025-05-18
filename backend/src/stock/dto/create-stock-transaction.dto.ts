import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StockTransactionType } from '../types/stock.types';

export class CreateStockTransactionDto {
  @IsNotEmpty()
  @IsString()
  stockItemId: string;

  @IsNotEmpty()
  @IsEnum(StockTransactionType)
  type: StockTransactionType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  sourceLocation?: string;

  @IsOptional()
  @IsString()
  destinationLocation?: string;
  
  @IsOptional()
  @IsString()
  performedBy?: string;
}
