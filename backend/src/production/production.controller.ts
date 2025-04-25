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
} from './dto/production-order.dto';
import { ProductionOrderStatus } from '../entities/production-order.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('production')
@Controller('production')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  async findAllOrders(@Query('status') status?: ProductionOrderStatus) {
    return this.productionService.findAll(status);
  }

  @Post('orders')
  async createProductionOrder(@Request() req, @Body() dto: CreateProductionOrderDto) {
    return this.productionService.createProductionOrder(dto, req.user);
  }

  @Get('orders/:id')
  async findOneOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionService.findOne(id);
  }

  @Put('orders/:id')
  async updateOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.productionService.update(id, dto);
  }

  @Put('orders/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionOrderStatusDto,
    @Request() req
  ) {
    return this.productionService.updateStatus(id, dto, req.user);
  }

  @Post('orders/:id/output')
  async recordProduction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordProductionOutputDto,
    @Request() req
  ) {
    return this.productionService.recordProduction(id, dto, req.user);
  }

  @Get('orders/:id/progress')
  async getProductionProgress(@Param('id', ParseUUIDPipe) id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.productionService.getProductionOrderProgress(id);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.productionService.delete(id);
  }

  // Employee productivity endpoints
  @Get('records')
  async getProductionRecords(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('bomId') bomId?: string
  ) {
    return this.productionService.getProductionRecords({
      startDate,
      endDate,
      employeeId,
      bomId,
    });
  }

  @Get('employees/efficiency')
  async getEmployeeEfficiency(@Query('date') dateString?: string) {
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
  ) {
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
  ) {
    const startDate = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.productionService.getEmployeeProductionReport(id, startDate, endDate);
  }

  @Get('efficiency')
  async getEfficiency() {
    return this.productionService.getEfficiencyMetrics();
  }

  @Get('output')
  async getOutput() {
    return this.productionService.getProductionOutput();
  }
}
