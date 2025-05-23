import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class StockCountItemDto {
  @IsNotEmpty()
  @IsString()
  stockItemId: string;

  @IsNotEmpty()
  @IsNumber()
  systemQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  actualQuantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateStockCountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  countDate: Date;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => StockCountItemDto)
  items: StockCountItemDto[];
}
