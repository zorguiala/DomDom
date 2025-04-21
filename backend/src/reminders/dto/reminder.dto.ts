import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum ReminderType {
  BILL = 'BILL',
  MAINTENANCE = 'MAINTENANCE',
  TASK = 'TASK',
  OTHER = 'OTHER',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: Date;

  @IsEnum(ReminderType)
  type: ReminderType;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;
}

export class UpdateReminderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsEnum(ReminderType)
  @IsOptional()
  type?: ReminderType;

  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;
}

export class ReminderResponseDto {
  id: number;
  title: string;
  description?: string;
  dueDate: Date;
  type: ReminderType;
  status: ReminderStatus;
  amount?: number;
  relatedEntityId?: number;
  createdAt: Date;
  updatedAt: Date;
}
