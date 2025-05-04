import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsNotEmpty, Min, IsEnum } from 'class-validator';
import { WastageReason } from '../../entities/inventory-wastage.entity';

export class CreateWastageRecordDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsOptional()
  batchId?: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsEnum(WastageReason)
  @IsNotEmpty()
  reason: WastageReason;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
