import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  IsUUID,
  IsEnum,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SaleType {
  DIRECT = 'DIRECT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class SaleItemDto {
  @ApiProperty({ description: 'The ID of the product being sold' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ description: 'The quantity of the product being sold' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'The unit price of the product' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'The type of sale', enum: SaleType })
  @IsEnum(SaleType)
  @IsNotEmpty()
  type: SaleType;

  @ApiProperty({ description: 'The ID of the commercial agent (required for commercial sales)' })
  @IsNumber()
  @IsOptional()
  agentId?: number;

  @ApiProperty({ description: 'The date of the sale' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  saleDate: Date;

  @ApiProperty({ description: 'List of items in the sale', type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @IsNotEmpty()
  items: SaleItemDto[];

  @ApiProperty({ description: 'Optional notes about the sale' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSaleDto {
  @ApiProperty({ description: 'The status of the sale', enum: SaleStatus })
  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @ApiProperty({ description: 'Optional notes about the sale' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SaleResponseDto {
  @ApiProperty({ description: 'The unique identifier of the sale' })
  id: number;

  @ApiProperty({ description: 'The type of sale', enum: SaleType })
  type: SaleType;

  @ApiProperty({ description: 'The ID of the commercial agent (if applicable)' })
  agentId?: number;

  @ApiProperty({ description: 'The date of the sale' })
  saleDate: Date;

  @ApiProperty({ description: 'The status of the sale', enum: SaleStatus })
  status: SaleStatus;

  @ApiProperty({ description: 'The total amount of the sale' })
  totalAmount: number;

  @ApiProperty({ description: 'Optional notes about the sale' })
  notes?: string;

  @ApiProperty({ description: 'The date and time when the sale was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the sale was last updated' })
  updatedAt: Date;
}

export class SalesQueryDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsNumber()
  @IsOptional()
  userId?: number;
}
