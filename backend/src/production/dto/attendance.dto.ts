import { IsUUID, IsString, IsOptional, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ClockInDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockOutDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClockInOutDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AttendanceQueryDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;
}

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetAttendanceFilterDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
