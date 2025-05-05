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
  Patch,
  Res,
  Header,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionOutputDto,
  GetProductionOrdersDto,
  FilterProductionOrdersDto,
} from './dto/production-order.dto';
import { ProductionOrder, ProductionOrderStatus } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ProductionOrderService } from './services/production-order.service';
import { ProductionRecordService } from './services/production-record.service';
import { NotificationService } from './services/notification.service';
import { ProductionStatisticsService } from './services/production-statistics.service';
import {
  CreateProductionRecordDto,
  GetProductionRecordsFilterDto,
  UpdateProductionRecordDto,
} from './dto/production.dto';
import {
  ProductionStatisticsDto,
  ProductionStatisticsResult,
  ExportReportDto,
} from './dto/production-report.dto';
import {
  GetNotificationsFilterDto,
  NotificationResponse,
} from './dto/notification.dto';
import { Response } from 'express';

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
import { ProductionReportDto } from '../types/productionReport.dto';

// Define RequestWithUser interface to fix the 'any' type in request objects
interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('production')
@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(
    private readonly productionService: ProductionService,
    private readonly productionOrderService: ProductionOrderService,
    private readonly productionRecordService: ProductionRecordService,
    private readonly notificationService: NotificationService,
    private readonly productionStatisticsService: ProductionStatisticsService,
  ) {}

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
  @ApiOperation({ summary: 'Create a new production order' })
  @ApiResponse({ status: 201, description: 'Production order created successfully' })
  async createProductionOrder(
    @Body() createDto: CreateProductionOrderDto,
    @Request() req: RequestWithUser,
  ): Promise<ProductionOrder> {
    return this.productionOrderService.createProductionOrder(createDto, req.user);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a production order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the production order' })
  @ApiParam({ name: 'id', description: 'Production order ID' })
  async findOneOrder(@Param('id', ParseUUIDPipe) id: string): Promise<ProductionOrder> {
    return this.productionOrderService.findOne(id);
  }

  @Put('orders/:id')
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderDto
  ): Promise<ProductionOrder> {
    return this.productionOrderService.update(id, dto);
  }

  @Put('orders/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderStatusDto
  ): Promise<ProductionOrder> {
    return this.productionOrderService.updateStatus(id, dto);
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
    return this.productionOrderService.delete(id);
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
  async getProductionReport(@Query() query: any): Promise<ProductionReportDto> {
    return this.productionService.getProductionReport(query);
  }

  // Batch tracking endpoints

  @ApiOperation({ summary: 'Get batch status for a production order' })
  @ApiResponse({ status: 200, description: 'Returns batch status information' })
  @ApiParam({ name: 'id', description: 'Production order ID' })
  @Get('orders/:id/batch-status')
  async getBatchStatus(@Param('id') id: string): Promise<{
    batchCount: number;
    completedBatches: number;
    inProgressBatches: number;
    remainingBatches: number;
    nextBatchNumber: string | null;
    batches: { batchNumber: string; quantity: number; status: string; qualityChecked: boolean }[];
  }> {
    return this.productionOrderService.getBatchStatus(id);
  }

  @ApiOperation({ summary: 'Get production records grouped by batch' })
  @ApiResponse({ status: 200, description: 'Returns records grouped by batch' })
  @ApiParam({ name: 'id', description: 'Production order ID' })
  @Get('orders/:id/records-by-batch')
  async getRecordsByBatch(
    @Param('id') id: string,
  ): Promise<{
    batchNumber: string;
    quantity: number;
    qualityChecked: boolean;
    records: ProductionRecord[];
  }[]> {
    return this.productionRecordService.getRecordsByBatch(id);
  }

  // Production Record endpoints

  @ApiOperation({ summary: 'Create a new production record' })
  @ApiResponse({ status: 201, description: 'Production record created successfully' })
  @Post('records')
  async createProductionRecord(
    @Body() createDto: CreateProductionRecordDto,
  ): Promise<ProductionRecord> {
    return this.productionRecordService.createProductionRecord(createDto);
  }

  @ApiOperation({ summary: 'Get production records with filtering' })
  @ApiResponse({ status: 200, description: 'Returns filtered production records' })
  @Get('records')
  async getProductionRecordsFiltered(
    @Query() filterDto: GetProductionRecordsFilterDto,
  ): Promise<ProductionRecord[]> {
    return this.productionRecordService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Get a production record by ID' })
  @ApiResponse({ status: 200, description: 'Returns the production record' })
  @ApiParam({ name: 'id', description: 'Production record ID' })
  @Get('records/:id')
  async getProductionRecordById(@Param('id') id: string): Promise<ProductionRecord> {
    return this.productionRecordService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a production record' })
  @ApiResponse({ status: 200, description: 'Production record updated successfully' })
  @ApiParam({ name: 'id', description: 'Production record ID' })
  @Patch('records/:id')
  async updateProductionRecord(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductionRecordDto,
  ): Promise<ProductionRecord> {
    return this.productionRecordService.updateProductionRecord(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a production record' })
  @ApiResponse({ status: 200, description: 'Production record deleted successfully' })
  @ApiParam({ name: 'id', description: 'Production record ID' })
  @Delete('records/:id')
  async deleteProductionRecord(@Param('id') id: string): Promise<void> {
    return this.productionRecordService.remove(id);
  }

  // Quality control endpoints

  @ApiOperation({ summary: 'Get quality control statistics' })
  @ApiResponse({ status: 200, description: 'Returns quality control statistics' })
  @Get('quality-statistics')
  async getQualityControlStats(
    @Query() filterDto: GetProductionRecordsFilterDto,
  ): Promise<{
    totalRecords: number;
    qualityCheckedRecords: number;
    qualityCheckRate: number;
    issuesFound: number;
    issueRate: number;
  }> {
    return this.productionRecordService.getQualityControlStats(filterDto);
  }

  // Statistics and reporting endpoints

  @ApiOperation({ summary: 'Get production statistics and metrics' })
  @ApiResponse({ status: 200, description: 'Returns production statistics' })
  @Post('statistics')
  async getProductionStatisticsDto(
    @Body() statsDto: ProductionStatisticsDto,
  ): Promise<ProductionStatisticsResult> {
    return this.productionStatisticsService.getProductionStatistics(statsDto);
  }

  @ApiOperation({ summary: 'Export production report' })
  @ApiResponse({ status: 200, description: 'Returns the exported report file' })
  @Post('export')
  async exportProductionReport(
    @Body() exportDto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.productionStatisticsService.exportProductionReport(exportDto);
    
    // Set content type and file name based on format
    const format = exportDto.format;
    const filename = `production-report-${new Date().toISOString().split('T')[0]}.${format}`;
    
    let contentType: string;
    if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (format === 'pdf') {
      contentType = 'application/pdf';
    } else if (format === 'csv') {
      contentType = 'text/csv';
    } else {
      contentType = 'application/octet-stream';
    }
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': buffer.length,
    });
    
    res.end(buffer);
  }

  // Notification endpoints

  @ApiOperation({ summary: 'Get production notifications' })
  @ApiResponse({ status: 200, description: 'Returns notifications' })
  @Get('notifications')
  async getNotifications(
    @Query() filterDto: GetNotificationsFilterDto,
  ): Promise<NotificationResponse[]> {
    return this.notificationService.getNotifications(filterDto);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string): Promise<NotificationResponse> {
    return this.notificationService.markAsRead(id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Patch('notifications/mark-all-read/:userId')
  async markAllNotificationsAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationService.markAllAsRead(userId);
  }
}
