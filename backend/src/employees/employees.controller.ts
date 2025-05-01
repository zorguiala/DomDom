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
import { CreateEmployeeDto, UpdateEmployeeDto, MarkAttendanceDto } from './dto/employee.dto';
import { Employee } from '../entities/employee.entity';
import { EmployeeAttendance } from '../entities/employee-attendance.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly attendanceService: AttendanceService
  ) {}

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

  // Attendance endpoints
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
}
