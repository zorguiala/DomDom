import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product SKU (Stock Keeping Unit)' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Unit of measurement (e.g., kg, pieces, etc.)' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Product barcode' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Minimum stock level for alerts' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'Whether the product is a raw material' })
  @IsBoolean()
  @IsOptional()
  isRawMaterial?: boolean;

  @ApiPropertyOptional({ description: 'Whether the product is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
