import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateInventoryBatchDto } from './create-inventory-batch.dto';

export class UpdateInventoryBatchDto extends PartialType(CreateInventoryBatchDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
