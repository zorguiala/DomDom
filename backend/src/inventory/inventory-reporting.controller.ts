/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryReportingService } from './inventory-reporting.service';
import { Product } from '../entities/product.entity';
import { ApiTags } from '@nestjs/swagger';

// Define interfaces for return types
interface InventoryValueReport {
  totalValue: number;
  rawMaterialsValue: number;
  finishedProductsValue: number;
  rawMaterialsCount: number;
  finishedProductsCount: number;
  productCount: number;
}

interface ProductMovementReport {
  product: Product;
  period: {
    startDate: Date;
    endDate: Date;
  };
  openingStock: number;
  closingStock: number;
  totalsByType: Record<string, number>;
  transactions: any[];
  dailyMovement: any[];
}

interface ProductTurnoverData {
  product: Product;
  unitsSold: number;
  averageInventory: number;
  turnoverRate: number;
}

interface ProductionInventoryImpact {
  period: {
    startDate: Date;
    endDate: Date;
  };
  productionIn: any;
  productionOut: any;
  netImpact: number;
}

@ApiTags('inventory')
@Controller('inventory/reports')
@UseGuards(JwtAuthGuard)
export class InventoryReportingController {
  constructor(private readonly inventoryReportingService: InventoryReportingService) {}

  @Get('value')
  async getInventoryValueReport(): Promise<InventoryValueReport> {
    return this.inventoryReportingService.getInventoryValueReport();
  }

  @Get('product/:id/movement')
  async getProductMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string
  ): Promise<ProductMovementReport> {
    if (!startDateString || !endDateString) {
      throw new BadRequestException('Start date and end date are required');
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.inventoryReportingService.getProductMovement(id, startDate, endDate);
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('threshold') threshold?: number): Promise<Product[]> {
    return this.inventoryReportingService.getLowStockProducts(threshold);
  }

  @Get('turnover')
  async getStockTurnoverRate(
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string
  ): Promise<ProductTurnoverData[]> {
    // Default to last 30 days if dates not provided
    const startDate = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.inventoryReportingService.getStockTurnoverRate(startDate, endDate);
  }

  @Get('production-impact')
  async getProductionInventoryImpact(
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string
  ): Promise<ProductionInventoryImpact> {
    // Default to last 30 days if dates not provided
    const startDate = startDateString
      ? new Date(startDateString)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.inventoryReportingService.getProductionInventoryImpact(startDate, endDate);
  }

  @Get('stats')
  async getStats() {
    return this.inventoryReportingService.getInventoryStats();
  }

  @Get('status')
  async getStatus() {
    return this.inventoryReportingService.getInventoryStatus();
  }
}
