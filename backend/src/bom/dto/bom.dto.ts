import { IsArray, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BOMItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  wastagePercent?: number;
}

export class CreateBOMDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  outputQuantity: number;

  @IsString()
  outputUnit: string;

  @IsString()
  @IsUUID()
  outputProductId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  items: BOMItemDto[];
  
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBOMDto extends CreateBOMDto {}

export class ProductionOrderDto {
  @IsString()
  bomId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  plannedStartDate: string;

  @IsString()
  priority: 'low' | 'medium' | 'high';
}
