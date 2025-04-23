import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ description: 'The title of the reminder' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Optional description of the reminder', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The due date of the reminder' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({
    description: 'The type of reminder',
    enum: ReminderType,
    default: ReminderType.OTHER,
  })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({
    description: 'Optional amount associated with the reminder',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Optional ID of a related entity',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;
}

export class UpdateReminderDto {
  @ApiProperty({ description: 'The title of the reminder', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Optional description of the reminder', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The due date of the reminder', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({
    description: 'The type of reminder',
    enum: ReminderType,
    required: false,
  })
  @IsEnum(ReminderType)
  @IsOptional()
  type?: ReminderType;

  @ApiProperty({
    description: 'The status of the reminder',
    enum: ReminderStatus,
    required: false,
  })
  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;

  @ApiProperty({
    description: 'Optional amount associated with the reminder',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Optional ID of a related entity',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  relatedEntityId?: number;
}

export class ReminderResponseDto {
  @ApiProperty({ description: 'The unique identifier of the reminder' })
  id: number;

  @ApiProperty({ description: 'The title of the reminder' })
  title: string;

  @ApiProperty({ description: 'Optional description of the reminder', required: false })
  description?: string;

  @ApiProperty({ description: 'The due date of the reminder' })
  dueDate: Date;

  @ApiProperty({
    description: 'The type of reminder',
    enum: ReminderType,
  })
  type: ReminderType;

  @ApiProperty({
    description: 'The status of the reminder',
    enum: ReminderStatus,
  })
  status: ReminderStatus;

  @ApiProperty({
    description: 'Optional amount associated with the reminder',
    required: false,
    type: Number,
  })
  amount?: number;

  @ApiProperty({
    description: 'Optional ID of a related entity',
    required: false,
    type: Number,
  })
  relatedEntityId?: number;

  @ApiProperty({ description: 'The date and time when the reminder was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the reminder was last updated' })
  updatedAt: Date;
}
