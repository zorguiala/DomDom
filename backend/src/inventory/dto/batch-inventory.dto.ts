import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../entities/inventory-transaction.entity';

export class BatchInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class BatchInventoryDto {
  @IsArray()
  @IsNotEmpty()
  items: BatchInventoryItemDto[];
}
