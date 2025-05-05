import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDate,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductionRecordDto {
  @ApiProperty({ description: 'BOM ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  bomId: string;

  @ApiProperty({ description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Production order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productionOrderId: string;

  @ApiProperty({ description: 'Quantity produced', example: 50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Wastage quantity', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  wastage?: number;

  @ApiProperty({ description: 'Notes', example: 'Production proceeded normally', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  // Quality control fields
  @ApiProperty({ description: 'Was quality control performed', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  qualityChecked?: boolean;

  @ApiProperty({
    description: 'Quality control notes',
    example: 'All quality standards met',
    required: false,
  })
  @IsString()
  @IsOptional()
  qualityNotes?: string;

  // Batch tracking fields
  @ApiProperty({ description: 'Batch number', example: 'BREAD-20230501-1', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Batch expiry date', example: '2023-05-15', required: false })
  @IsString()
  @IsOptional()
  batchExpiryDate?: string;

  @ApiProperty({ description: 'Batch storage location', example: 'Warehouse A', required: false })
  @IsString()
  @IsOptional()
  batchLocation?: string;
}

export class StartProductionDto {
  @IsUUID()
  @IsNotEmpty()
  bomId: string;

  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CompleteProductionDto {
  @IsNumber()
  @IsOptional()
  wastage?: number;

  @IsBoolean()
  @IsOptional()
  qualityChecked?: boolean;

  @IsString()
  @IsOptional()
  qualityNotes?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;
}

export class GetProductionRecordsDto {
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsUUID()
  @IsOptional()
  bomId?: string;
}

export class UpdateProductionDto {
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  wastage?: number;

  @IsBoolean()
  @IsOptional()
  qualityChecked?: boolean;

  @IsString()
  @IsOptional()
  qualityNotes?: string;
}

export class UpdateProductionRecordDto {
  @ApiProperty({ description: 'Quantity produced', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @ApiProperty({ description: 'Wastage quantity', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  wastage?: number;

  @ApiProperty({ description: 'Notes', example: 'Production proceeded normally', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  // Quality control fields
  @ApiProperty({ description: 'Was quality control performed', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  qualityChecked?: boolean;

  @ApiProperty({
    description: 'Quality control notes',
    example: 'All quality standards met',
    required: false,
  })
  @IsString()
  @IsOptional()
  qualityNotes?: string;

  // Batch tracking fields
  @ApiProperty({ description: 'Batch number', example: 'BREAD-20230501-1', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Batch expiry date', example: '2023-05-15', required: false })
  @IsString()
  @IsOptional()
  batchExpiryDate?: string;

  @ApiProperty({ description: 'Batch storage location', example: 'Warehouse A', required: false })
  @IsString()
  @IsOptional()
  batchLocation?: string;
}

export class GetProductionRecordsFilterDto {
  @ApiProperty({ description: 'Start date', example: '2023-01-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date', example: '2023-01-31', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({
    description: 'BOM ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  bomId?: string;

  @ApiProperty({
    description: 'Production order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  productionOrderId?: string;

  @ApiProperty({ description: 'Filter records with quality check', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  qualityChecked?: boolean;

  @ApiProperty({
    description: 'Filter records by batch number',
    example: 'BREAD-',
    required: false,
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

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
