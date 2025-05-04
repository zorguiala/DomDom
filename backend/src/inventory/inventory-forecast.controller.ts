import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseArrayPipe,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryForecastService } from './services/inventory-forecast.service';

/**
 * Controller for inventory forecasting and intelligent low stock alerts
 * Provides endpoints for predicting stock needs based on historical usage
 */
@Controller('inventory/forecast')
@UseGuards(JwtAuthGuard)
export class InventoryForecastController {
  constructor(
    private readonly forecastService: InventoryForecastService
  ) {}

  /**
   * Get forecasts for all products or specific products
   * Includes intelligent low stock alerts based on historical usage
   */
  @Get()
  async getForecasts(
    @Query('productIds', new ParseArrayPipe({ optional: true })) productIds?: string[],
  ) {
    return this.forecastService.getInventoryForecasts(productIds);
  }

  /**
   * Get products with critically low stock levels (less than 7 days of stock)
   * based on historical usage patterns
   */
  @Get('critical')
  async getCriticalLowStock() {
    return this.forecastService.getCriticalLowStockProducts();
  }

  /**
   * Get products that will need replenishment soon but are not yet critical
   * (7-14 days of stock remaining)
   */
  @Get('upcoming')
  async getUpcomingReplenishments() {
    return this.forecastService.getUpcomingReplenishments();
  }

  /**
   * Get reorder suggestions based on economic order quantity, lead time, and usage patterns
   * Provides optimal reorder quantities and timing
   */
  @Get('reorder-suggestions')
  async getReorderSuggestions() {
    return this.forecastService.getReorderSuggestions();
  }

  /**
   * Get low stock alerts for products that need attention
   */
  @Get('low-stock')
  async getLowStockAlerts() {
    return this.forecastService.getLowStockAlerts();
  }

  /**
   * Get inventory optimization metrics including turnover rate and holding costs
   */
  @Get('optimization')
  async getOptimizationMetrics() {
    return this.forecastService.getOptimizationMetrics();
  }

  /**
   * Get historical usage trends for a specific product
   * @param productId ID of the product to analyze
   * @param period Period in days to analyze (default: 90 days)
   */
  @Get('usage-trend/:productId')
  async getUsageTrend(
    @Param('productId') productId: string,
    @Query('period') period: number = 90,
  ) {
    return this.forecastService.getUsageTrend(productId, period);
  }
}
