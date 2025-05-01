import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionOutputDto,
  GetProductionOrdersDto,
} from './dto/production-order.dto';
import { ProductionOrder, ProductionOrderStatus } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

// Import centralized types
import {
  EfficiencyMetrics,
  ProductionOutput,
  ProductionOrderProgress,
  EmployeeProductivityMetrics,
  EmployeeEfficiency,
  EmployeeProductionReport,
} from '../types/production.types';

import { ProductionOutputDto } from '../types/productionOutput.dto';
import { GetProductionReportDto } from './dto/production-report.dto';
import { ProductionReportDto } from '../types/productionReport.dto';

// Define RequestWithUser interface to fix the 'any' type in request objects
interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('production')
@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  @ApiQuery({ name: 'status', required: false, enum: ProductionOrderStatus })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({ name: 'bomId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async findAllOrders(@Query() query: GetProductionOrdersDto): Promise<any> {
    return this.productionService.findAllWithFilters(query);
  }

  @Post('orders')
  async createProductionOrder(
    @Request() req: RequestWithUser,
    @Body() dto: CreateProductionOrderDto
  ): Promise<ProductionOrder> {
    return this.productionService.createProductionOrder(dto, req.user);
  }

  @Get('orders/:id')
  async findOneOrder(@Param('id', ParseUUIDPipe) id: string): Promise<ProductionOrder> {
    return this.productionService.findOne(id);
  }

  @Put('orders/:id')
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderDto
  ): Promise<ProductionOrder> {
    return this.productionService.update(id, dto);
  }

  @Put('orders/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderStatusDto
  ): Promise<ProductionOrder> {
    return this.productionService.updateStatus(id, dto);
  }

  @Post('orders/:id/output')
  async recordProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordProductionOutputDto,
    @Request() req: RequestWithUser
  ): Promise<ProductionOrder> {
    return this.productionService.recordProduction(id, dto, req.user);
  }

  @Get('orders/:id/progress')
  async getProductionProgress(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProductionOrderProgress> {
    return this.productionService.getProductionOrderProgress(id);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productionService.delete(id);
  }

  // Employee productivity endpoints
  @Get('records')
  async getProductionRecords(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('bomId') bomId?: string
  ): Promise<ProductionRecord[]> {
    return this.productionService.getProductionRecords({
      startDate,
      endDate,
      employeeId,
      bomId,
    });
  }

  @Get('employees/efficiency')
  async getEmployeeEfficiency(@Query('date') dateString?: string): Promise<EmployeeEfficiency[]> {
    const date = dateString ? new Date(dateString) : new Date();

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.productionService.getEmployeeProductionEfficiency(date);
  }

  @Get('employees/:id/productivity')
  async calculateEmployeeProductivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string
  ): Promise<EmployeeProductivityMetrics> {
    const startDate = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.productionService.calculateEmployeeProductivity(id, startDate, endDate);
  }

  @Get('employees/:id/report')
  async getEmployeeProductionReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string
  ): Promise<EmployeeProductionReport> {
    const startDate = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.productionService.getEmployeeProductionReport(id, startDate, endDate);
  }

  @Get('efficiency')
  async getEfficiency(): Promise<EfficiencyMetrics> {
    return this.productionService.getEfficiencyMetrics();
  }

  @Get('output')
  async getOutput(): Promise<ProductionOutput> {
    return this.productionService.getProductionOutput();
  }

  /**
   * Get production statistics for a given date range (MVP: daily total output and efficiency)
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get production statistics for a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Production statistics', type: [ProductionOutputDto] })
  async getProductionStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<ProductionOutputDto[]> {
    return this.productionService.getProductionStatistics(new Date(startDate), new Date(endDate));
  }

  /**
   * Generate a production report for a given date range, BOM, or employee
   */
  @Get('reports')
  @ApiOperation({ summary: 'Get production report (filterable by date, BOM, employee)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'bomId', required: false, type: String })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Production report', type: ProductionReportDto })
  async getProductionReport(@Query() query: GetProductionReportDto): Promise<ProductionReportDto> {
    return this.productionService.getProductionReport(query);
  }
}
