import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../entities/inventory-transaction.entity';

export class CreateInventoryTransactionDto {
  @IsString()
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
