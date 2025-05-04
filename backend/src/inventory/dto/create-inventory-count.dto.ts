import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNotEmpty,
  Min,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryCountStatus } from '../../entities/inventory-count.entity';

export class InventoryCountItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsNumber()
  @Min(0)
  expectedQuantity: number;

  @IsNumber()
  @Min(0)
  actualQuantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isReconciled?: boolean;
}

export class CreateInventoryCountDto {
  @IsDateString()
  @IsNotEmpty()
  countDate: Date;

  @IsString()
  @IsNotEmpty()
  status: InventoryCountStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryCountItemDto)
  items: InventoryCountItemDto[];
}
