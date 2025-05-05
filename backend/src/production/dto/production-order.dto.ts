import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsDate,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductionOrderPriority,
  ProductionOrderStatus,
} from '../../entities/production-order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductionOrderDto {
  @ApiProperty({ description: 'BOM ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  bomId: string;

  @ApiProperty({ description: 'Order quantity', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Planned start date', example: '2023-01-01T00:00:00Z' })
  @IsString()
  @IsNotEmpty()
  plannedStartDate: string;

  @ApiProperty({ description: 'Priority level', enum: ProductionOrderPriority, example: ProductionOrderPriority.MEDIUM })
  @IsEnum(ProductionOrderPriority)
  @IsOptional()
  priority?: ProductionOrderPriority;

  @ApiProperty({ description: 'Assigned user ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ description: 'Notes', example: 'Special instructions for production', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
  
  // New batch tracking fields
  @ApiProperty({ description: 'Is this a batch production', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isBatchProduction?: boolean;
  
  @ApiProperty({ description: 'Batch prefix for generating batch numbers', example: 'BREAD-', required: false })
  @IsString()
  @IsOptional()
  batchPrefix?: string;
  
  @ApiProperty({ description: 'Size of each batch', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  batchSize?: number;
  
  @ApiProperty({ description: 'Number of batches', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  batchCount?: number;
}

export class UpdateProductionOrderDto {
  @ApiProperty({ description: 'BOM ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  bomId?: string;

  @ApiProperty({ description: 'Order quantity', example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @ApiProperty({ description: 'Planned start date', example: '2023-01-01T00:00:00Z', required: false })
  @IsString()
  @IsOptional()
  plannedStartDate?: string;

  @ApiProperty({ description: 'Priority level', enum: ProductionOrderPriority, example: ProductionOrderPriority.MEDIUM, required: false })
  @IsEnum(ProductionOrderPriority)
  @IsOptional()
  priority?: ProductionOrderPriority;

  @ApiProperty({ description: 'Assigned user ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ description: 'Notes', example: 'Special instructions for production', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
  
  // New batch tracking fields
  @ApiProperty({ description: 'Is this a batch production', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isBatchProduction?: boolean;
  
  @ApiProperty({ description: 'Batch prefix for generating batch numbers', example: 'BREAD-', required: false })
  @IsString()
  @IsOptional()
  batchPrefix?: string;
  
  @ApiProperty({ description: 'Size of each batch', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  batchSize?: number;
  
  @ApiProperty({ description: 'Number of batches', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  batchCount?: number;
}

export class UpdateProductionOrderStatusDto {
  @ApiProperty({ description: 'Production order status', enum: ProductionOrderStatus })
  @IsNotEmpty()
  @IsEnum(ProductionOrderStatus)
  status: ProductionOrderStatus;
}

export class RecordProductionOutputDto {
  @IsNumber()
  quantity: number;

  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetProductionOrdersDto {
  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  bomId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

// New DTO for advanced filtering
export class FilterProductionOrdersDto {
  @ApiProperty({ description: 'Filter by status', enum: ProductionOrderStatus, required: false })
  @IsEnum(ProductionOrderStatus)
  @IsOptional()
  status?: ProductionOrderStatus;
  
  @ApiProperty({ description: 'Filter by priority', enum: ProductionOrderPriority, required: false })
  @IsEnum(ProductionOrderPriority)
  @IsOptional()
  priority?: ProductionOrderPriority;
  
  @ApiProperty({ description: 'Filter by BOM ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  bomId?: string;
  
  @ApiProperty({ description: 'Filter by employee/user ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  employeeId?: string;
  
  @ApiProperty({ description: 'Filter by date range - start', example: '2023-01-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;
  
  @ApiProperty({ description: 'Filter by date range - end', example: '2023-01-31', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;
  
  @ApiProperty({ description: 'Search term for BOM name', example: 'bread', required: false })
  @IsString()
  @IsOptional()
  search?: string;
  
  @ApiProperty({ description: 'Only show batch production orders', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isBatchProductionOnly?: boolean;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;
  
  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
