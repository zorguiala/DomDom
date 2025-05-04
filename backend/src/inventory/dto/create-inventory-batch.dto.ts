import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class CreateInventoryBatchDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsDateString()
  @IsNotEmpty()
  receivedDate: Date;

  @IsDateString()
  @IsOptional()
  manufactureDate?: Date;

  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
