import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'Search term for product name, SKU, or barcode' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by raw material status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isRawMaterial?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
