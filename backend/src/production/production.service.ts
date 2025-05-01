import { Injectable, Logger } from '@nestjs/common';
import { ProductionOrderStatus, ProductionOrder } from '../entities/production-order.entity';
import { ProductionRecord } from '../entities/production-record.entity';
import { User } from '../entities/user.entity';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionOutputDto,
  GetProductionOrdersDto,
} from './dto/production-order.dto';
import { GetProductionReportDto } from './dto/production-report.dto';
import { ProductionReportDto } from '../types/productionReport.dto';
import { ProductionOrderService } from './services/production-order.service';
import { ProductionRecordService } from './services/production-record.service';
import { MaterialConsumptionService } from './services/material-consumption.service';
import { EmployeeProductivityService } from './services/employee-productivity.service';
import { QueryRunner } from 'typeorm';
import {
  EfficiencyMetrics,
  ProductionOutput,
  ProductionOrderProgress,
  EmployeeProductivityMetrics,
  EmployeeEfficiency,
  EmployeeProductionReport,
  RecordsByEmployee,
} from '../types/production.types';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
  constructor(
    private readonly productionOrderService: ProductionOrderService,
    private readonly productionRecordService: ProductionRecordService,
    private readonly materialConsumptionService: MaterialConsumptionService,
    private readonly employeeProductivityService: EmployeeProductivityService
  ) {}

  async createProductionOrder(dto: CreateProductionOrderDto, user: User): Promise<ProductionOrder> {
    return this.productionOrderService.createProductionOrder(dto, user);
  }

  async findAll(status?: ProductionOrderStatus): Promise<ProductionOrder[]> {
    return this.productionOrderService.findAll(status);
  }

  async findOne(id: string): Promise<ProductionOrder> {
    return this.productionOrderService.findOne(id);
  }

  async update(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    return this.productionOrderService.update(id, dto);
  }

  async updateStatus(id: string, dto: UpdateProductionOrderStatusDto): Promise<ProductionOrder> {
    try {
      return await this.productionOrderService.updateStatus(id, dto);
    } catch (error) {
      this.logger.error(
        `Error updating production order status: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async delete(id: string): Promise<void> {
    await this.productionOrderService.delete(id);
  }

  async getProductionOrderProgress(id: string): Promise<ProductionOrderProgress> {
    const result = await this.productionOrderService.getProductionOrderProgress(id);
    return {
      order: result.order,
      totalCompletedQuantity: Number(result.totalCompletedQuantity),
      percentComplete: Number(result.percentComplete),
      recordsByEmployee: Array.isArray(result.recordsByEmployee)
        ? result.recordsByEmployee.map((r: RecordsByEmployee) => ({
            employee: r.employee,
            totalQuantity: Number(r.totalQuantity),
            records: Array.isArray(r.records) ? r.records : [],
          }))
        : [],
    };
  }

  async recordProduction(
    orderId: string,
    dto: RecordProductionOutputDto,
    user: User
  ): Promise<ProductionOrder> {
    return this.productionRecordService.recordProduction(orderId, dto, user);
  }

  async getProductionRecords(filters: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    bomId?: string;
  }): Promise<ProductionRecord[]> {
    const records = await this.productionRecordService.getProductionRecords(filters);
    return Array.isArray(records) ? records : [];
  }

  async getEfficiencyMetrics(): Promise<EfficiencyMetrics> {
    const metrics = await this.productionRecordService.getEfficiencyMetrics();
    return {
      date: new Date(metrics.date),
      totalOutput: Number(metrics.totalOutput),
      plannedOutput: Number(metrics.plannedOutput),
      efficiency: Number(metrics.efficiency),
      unitsMissing: Number(metrics.unitsMissing),
    };
  }

  async getProductionOutput(): Promise<ProductionOutput> {
    const output = await this.productionRecordService.getProductionOutput();
    return {
      date: output.date instanceof Date ? output.date : new Date(output.date),
      outputs: Array.isArray(output.outputs)
        ? output.outputs.map((item) => ({
            product: String(item.product),
            quantity: Number(item.quantity),
          }))
        : [],
      totalOutput: Number(output.totalOutput),
    };
  }

  async consumeProductionMaterials(
    order: ProductionOrder,
    user: User,
    queryRunner: QueryRunner
  ): Promise<void> {
    await this.materialConsumptionService.consumeProductionMaterials(order, user, queryRunner);
  }

  async calculateEmployeeProductivity(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmployeeProductivityMetrics> {
    return this.employeeProductivityService.calculateEmployeeProductivity(
      employeeId,
      startDate,
      endDate
    );
  }

  async getEmployeeProductionEfficiency(date: Date = new Date()): Promise<EmployeeEfficiency[]> {
    return this.employeeProductivityService.getEmployeeProductionEfficiency(date);
  }

  async getEmployeeProductionReport(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmployeeProductionReport> {
    return this.employeeProductivityService.getEmployeeProductionReport(
      employeeId,
      startDate,
      endDate
    );
  }

  /**
   * Advanced filtering, pagination, and sorting for production orders
   */
  async findAllWithFilters(
    query: GetProductionOrdersDto
  ): Promise<{ data: ProductionOrder[]; total: number; page: number; limit: number }> {
    return this.productionOrderService.findAllWithFilters(query);
  }

  /**
   * Get production statistics for a given date range (MVP: daily total output and efficiency)
   */
  async getProductionStatistics(startDate: Date, endDate: Date): Promise<ProductionOutput[]> {
    return this.productionRecordService.getProductionStatistics(startDate, endDate);
  }

  /**
   * Generate a production report for a given date range, BOM, or employee
   */
  async getProductionReport(query: GetProductionReportDto): Promise<ProductionReportDto> {
    return this.productionRecordService.getProductionReport(query);
  }
}
