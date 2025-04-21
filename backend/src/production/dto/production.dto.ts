import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductionRecordDto {
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
