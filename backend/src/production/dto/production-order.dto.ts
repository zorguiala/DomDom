import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductionOrderPriority,
  ProductionOrderStatus,
} from '../../entities/production-order.entity';

export class CreateProductionOrderDto {
  @IsString()
  @IsNotEmpty()
  bomId: string;

  @IsNumber()
  quantity: number;

  @IsDate()
  @Type(() => Date)
  plannedStartDate: Date;

  @IsEnum(ProductionOrderPriority)
  priority: ProductionOrderPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductionOrderDto {
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  plannedStartDate?: Date;

  @IsOptional()
  @IsEnum(ProductionOrderPriority)
  priority?: ProductionOrderPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductionOrderStatusDto {
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
