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

@Controller('employees/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  async clockIn(@Body() clockInDto: ClockInOutDto, @Request() req) {
    return this.attendanceService.clockIn(clockInDto, req.user);
  }

  @Post('clock-out')
  async clockOut(@Body() clockOutDto: ClockInOutDto, @Request() req) {
    return this.attendanceService.clockOut(clockOutDto, req.user);
  }

  @Get()
  async getAttendanceRecords(@Query() query: AttendanceQueryDto) {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.attendanceService.getAttendanceRecords(query);
  }

  @Get('summary')
  async getAttendanceSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.attendanceService.getAttendanceSummary(new Date(startDate), new Date(endDate));
  }
}
