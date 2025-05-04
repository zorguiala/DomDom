import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmployeeService } from './services/employee.service';
import { AttendanceService } from './services/attendance.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  MarkAttendanceDto,
  CreateScheduleDto,
  UpdateScheduleDto,
} from './dto/employee.dto';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeProductivity } from './types/employee.types';
import { EmployeeSchedule } from 'src/entities/employee-schedule.entity';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly attendanceService: AttendanceService
  ) {}

  // Basic employee endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Returns all employees' })
  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeService.findAll();
  }

  // Attendance endpoints - specific routes first
  @Get('attendance')
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Returns all attendance records' })
  async getAllAttendance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<EmployeeAttendance[]> {
    try {
      // If dates are provided, filter by date range
      if (startDate && endDate) {
        return this.attendanceService.getAllAttendance(new Date(startDate), new Date(endDate));
      }
      // Otherwise return all records (with a reasonable limit)
      return this.attendanceService.getAllAttendance();
    } catch (error) {
      // Fallback to today's attendance if there's an error
      const todayAttendance = await this.attendanceService.getTodayAttendance();
      return todayAttendance.records || [];
    }
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Mark employee attendance' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
  async markAttendance(@Body() markAttendanceDto: MarkAttendanceDto): Promise<EmployeeAttendance> {
    return this.attendanceService.markAttendance(markAttendanceDto);
  }

  @Get('attendance/today')
  @ApiOperation({ summary: "Get today's attendance summary" })
  @ApiResponse({ status: 200, description: "Returns today's attendance summary" })
  async getTodayAttendance() {
    return this.attendanceService.getTodayAttendance();
  }

  // Productivity endpoints - specific routes first
  @Get('productivity')
  @ApiOperation({ summary: 'Get productivity metrics for all employees' })
  @ApiResponse({ status: 200, description: 'Returns productivity metrics' })
  async getProductivityMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<EmployeeProductivity[]> {
    return this.employeeService.getProductivityMetrics(startDate, endDate);
  }

  // Schedule endpoints - specific routes first
  @Get('schedules')
  @ApiOperation({ summary: 'Get all employee schedules' })
  @ApiResponse({ status: 200, description: 'Returns all schedules' })
  async getSchedules(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<EmployeeSchedule[]> {
    return this.employeeService.getSchedules(startDate, endDate);
  }

  // Individual employee endpoints - these use :id parameter
  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Returns the employee' })
  async getEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  async updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate employee' })
  @ApiResponse({ status: 200, description: 'Employee deactivated successfully' })
  async removeEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.employeeService.remove(id);
  }

  @Get(':id/productivity')
  @ApiOperation({ summary: 'Get productivity metrics for a specific employee' })
  @ApiResponse({ status: 200, description: 'Returns employee productivity metrics' })
  async getEmployeeProductivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<EmployeeProductivity> {
    return this.employeeService.getEmployeeProductivity(id, startDate, endDate);
  }

  @Get(':employeeId/attendance')
  @ApiOperation({ summary: 'Get employee attendance records' })
  @ApiResponse({ status: 200, description: 'Returns employee attendance records' })
  async getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<EmployeeAttendance[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    return this.attendanceService.getEmployeeAttendance(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':employeeId/attendance/stats')
  @ApiOperation({ summary: 'Get employee attendance statistics' })
  @ApiResponse({ status: 200, description: 'Returns employee attendance statistics' })
  async getAttendanceStats(@Param('employeeId') employeeId: string) {
    return this.attendanceService.getAttendanceStats(employeeId);
  }

  @Get(':employeeId/schedule')
  @ApiOperation({ summary: 'Get schedules for a specific employee' })
  @ApiResponse({ status: 200, description: 'Returns employee schedules' })
  async getEmployeeSchedules(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<EmployeeSchedule[]> {
    const where: any = { employee: { id: employeeId } };

    if (startDate && endDate) {
      where.date = { $between: [new Date(startDate), new Date(endDate)] };
    }

    return this.employeeService.getEmployeeSchedules(employeeId, startDate, endDate);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Create schedule for an employee' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async createSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() schedule: CreateScheduleDto
  ): Promise<EmployeeSchedule> {
    return this.employeeService.createSchedule(id, schedule);
  }

  @Put(':id/schedule/:scheduleId')
  @ApiOperation({ summary: 'Update employee schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  async updateSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() schedule: UpdateScheduleDto
  ): Promise<EmployeeSchedule> {
    return this.employeeService.updateSchedule(id, scheduleId, schedule);
  }

  @Delete(':id/schedule/:scheduleId')
  @ApiOperation({ summary: 'Delete employee schedule' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  async deleteSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string
  ): Promise<void> {
    return this.employeeService.deleteSchedule(id, scheduleId);
  }
}
