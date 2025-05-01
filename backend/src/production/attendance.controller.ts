import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClockInOutDto, AttendanceQueryDto } from './dto/attendance.dto';
import { User } from '../entities/user.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { ApiTags } from '@nestjs/swagger';

// Define RequestWithUser interface to fix the 'any' type in request objects
interface RequestWithUser extends Request {
  user: User;
}

/**
 * Controller for employee attendance management
 */
@ApiTags('attendance')
@Controller('employees/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(
    @Body() clockInDto: ClockInOutDto,
    @Request() req: RequestWithUser
  ): Promise<EmployeeAttendance> {
    return this.attendanceService.clockIn(clockInDto, req.user);
  }

  @Post('clock-out')
  async clockOut(
    @Body() clockOutDto: ClockInOutDto,
    @Request() req: RequestWithUser
  ): Promise<EmployeeAttendance> {
    return this.attendanceService.clockOut(clockOutDto, req.user);
  }

  @Get()
  async getAttendanceRecords(@Query() query: AttendanceQueryDto): Promise<EmployeeAttendance[]> {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.attendanceService.getAttendanceRecords(query);
  }
}
