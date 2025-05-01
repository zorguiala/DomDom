import { BaseProductDto } from './base-product.dto';

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateProductDto extends BaseProductDto {
  @ApiProperty({ description: 'Initial stock quantity' })
  @IsNumber()
  @Min(0)
  initialStock: number;
}
