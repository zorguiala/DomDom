import {
  IsString,
  IsEmail,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeRole } from '../../entities/enums/employee.enum';
import { EmployeeScheduleShift } from '../../entities/employee-schedule.entity';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  position: string;

  @IsDate()
  @Type(() => Date)
  hireDate: Date;

  @IsNumber()
  salary: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  employeeId: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @IsNumber()
  monthlySalary: number;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  hireDate?: Date;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(EmployeeRole)
  @IsOptional()
  role?: EmployeeRole;

  @IsNumber()
  @IsOptional()
  monthlySalary?: number;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;
}

export class MarkAttendanceDto {
  @IsString()
  employeeId: string;

  @IsDate()
  @Type(() => Date)
  checkInTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  checkOutTime?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateScheduleDto {
  @IsString()
  @IsEnum(EmployeeScheduleShift)
  shift: EmployeeScheduleShift;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateScheduleDto extends CreateScheduleDto {}
