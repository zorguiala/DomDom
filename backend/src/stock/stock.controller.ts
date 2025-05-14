import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockService } from './services/stock.service';
import { StockTransactionService } from './services/stock-transaction.service';

@ApiTags('stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly stockTransactionService: StockTransactionService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock items' })
  @ApiResponse({ status: 200, description: 'Returns all stock items' })
  async getAllStock() {
    return this.stockService.getAllStock();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Returns items with stock below minimum threshold' })
  async getLowStockItems() {
    return this.stockService.getLowStockItems();
  }

  @Get('metrics/total-value')
  @ApiOperation({ summary: 'Get total stock value' })
  @ApiResponse({ status: 200, description: 'Returns total value of all stock' })
  async getTotalStockValue() {
    return {
      totalValue: await this.stockService.calculateTotalStockValue(),
    };
  }

  @Get('metrics/most-profitable')
  @ApiOperation({ summary: 'Get most profitable products' })
  @ApiResponse({ status: 200, description: 'Returns most profitable products' })
  async getMostProfitableProducts(@Query('limit') limit = 10) {
    return this.stockService.getMostProfitableProducts(+limit);
  }

  @Get('metrics/top-selling')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: 200, description: 'Returns top selling products' })
  async getTopSellingProducts(
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.stockService.getTopSellingProducts(+limit, dateRange);
  }

  @Get(':id/movement-history')
  @ApiOperation({ summary: 'Get stock movement history for a product' })
  @ApiResponse({ status: 200, description: 'Returns stock movement history' })
  async getStockMovementHistory(
    @Param('id') productId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.stockService.getStockMovementHistory(productId, dateRange);
  }
}
