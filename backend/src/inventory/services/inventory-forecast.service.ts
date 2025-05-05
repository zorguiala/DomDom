import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { InventoryTransaction, TransactionType } from '../../entities/inventory-transaction.entity';
import { InventoryStockService } from './inventory-stock.service';
import { InventoryForecast } from '../types/inventory-batch.types';

/**
 * Service to provide intelligent inventory forecasting and low stock alerts
 * based on historical usage patterns
 */
@Injectable()
export class InventoryForecastService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryTransaction)
    private transactionRepository: Repository<InventoryTransaction>,
    private stockService: InventoryStockService
  ) {}

  /**
   * Get inventory forecasts for all products or specific products
   * Includes intelligent low stock alerts based on historical usage
   */
  async getInventoryForecasts(productIds?: string[]): Promise<InventoryForecast[]> {
    // Get current stock levels
    const stockLevels = await this.stockService.getStockLevels(productIds);

    // Calculate forecasts for each product
    const forecasts: InventoryForecast[] = [];

    for (const stock of stockLevels) {
      // Skip products with no stock
      if (stock.currentStock <= 0) continue;

      // Calculate historical usage
      const usageData = await this.calculateHistoricalUsage(stock.productId);

      // Skip if no usage data
      if (!usageData.averageDailyUsage || usageData.averageDailyUsage <= 0) continue;

      // Calculate days remaining based on current stock and average usage
      const daysRemaining = Math.floor(stock.currentStock / usageData.averageDailyUsage);

      // Calculate depletion date
      const depletionDate = new Date();
      depletionDate.setDate(depletionDate.getDate() + daysRemaining);

      // Calculate reorder point (14 days supply by default, or 2x lead time if specified)
      const product = await this.productRepository.findOne({
        where: { id: stock.productId },
      });

      let reorderPoint = usageData.averageDailyUsage * 14; // Default 2 weeks
      if (product && product.leadTimeDays && product.leadTimeDays > 0) {
        // Reorder point = average daily usage * (lead time * 2 for safety)
        reorderPoint = usageData.averageDailyUsage * (product.leadTimeDays * 2);
      }

      // Determine if stock is low based on reorder point
      const isLow = stock.currentStock <= reorderPoint;

      // Calculate recommended reorder quantity (30 days supply by default)
      const recommendedReorderQuantity = Math.ceil(usageData.averageDailyUsage * 30);

      forecasts.push({
        productId: stock.productId,
        productName: stock.productName,
        currentStock: stock.currentStock,
        averageDailyUsage: usageData.averageDailyUsage,
        estimatedDepletion: depletionDate,
        daysRemaining,
        recommendedReorderQuantity,
        reorderPoint,
        isLow,
        usageTrend: usageData.trend,
      });
    }

    // Sort with most critical (lowest days remaining) first
    return forecasts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Calculate historical usage for a product based on past transactions
   */
  private async calculateHistoricalUsage(productId: string): Promise<{
    averageDailyUsage: number;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  }> {
    // Calculate usage over last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    // Get all OUT transactions in the period
    const transactions = await this.transactionRepository.find({
      where: {
        productId,
        type: TransactionType.OUT,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    if (transactions.length === 0) {
      return { averageDailyUsage: 0, trend: 'STABLE' };
    }

    // Calculate total usage
    const totalUsage = transactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);

    // Calculate average daily usage
    const days = 90; // Fixed period for consistency
    const averageDailyUsage = totalUsage / days;

    // Determine trend by comparing recent vs earlier usage
    const midpoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);

    const earlierTransactions = transactions.filter((tx) => tx.createdAt < midpoint);
    const recentTransactions = transactions.filter((tx) => tx.createdAt >= midpoint);

    const earlierUsage = earlierTransactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);

    const recentUsage = recentTransactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);

    // Compare usage between periods
    let trend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';

    if (recentUsage > earlierUsage * 1.2) {
      // 20% increase
      trend = 'INCREASING';
    } else if (recentUsage < earlierUsage * 0.8) {
      // 20% decrease
      trend = 'DECREASING';
    }

    return { averageDailyUsage, trend };
  }

  /**
   * Get critical low stock products that need immediate attention
   * based on historical usage and current stock levels
   */
  async getCriticalLowStockProducts(): Promise<InventoryForecast[]> {
    const allForecasts = await this.getInventoryForecasts();

    // Filter for critical items (less than 7 days of stock)
    return allForecasts.filter((forecast) => forecast.isLow && forecast.daysRemaining <= 7);
  }

  /**
   * Get products that will need replenishment soon
   * (not critical yet, but approaching reorder point)
   */
  async getUpcomingReplenishments(): Promise<InventoryForecast[]> {
    const allForecasts = await this.getInventoryForecasts();

    // Filter for items that will need replenishment in the next 14 days
    // but are not critical yet
    return allForecasts.filter(
      (forecast) => forecast.isLow && forecast.daysRemaining > 7 && forecast.daysRemaining <= 14
    );
  }

  /**
   * Get reorder suggestions with economic order quantities and priority levels
   * @returns Array of reorder suggestions with optimal order quantities
   */
  async getReorderSuggestions() {
    const allForecasts = await this.getInventoryForecasts();

    // Get all products data for cost information
    const productIds = allForecasts.map((f) => f.productId);
    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    // Create a map for quick lookups
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Filter for items that need reordering and add detailed reorder information
    const suggestions = allForecasts
      .filter((forecast) => forecast.isLow)
      .map((forecast) => {
        const product = productMap.get(forecast.productId);
        const costPrice = product?.costPrice || 0;
        const leadTimeDays = product?.leadTimeDays || 14; // Default to 2 weeks if not specified

        // Calculate economic order quantity (EOQ) if cost price is available
        // Using simplified EOQ formula: sqrt((2 * Annual Demand * Order Cost) / (Holding Cost % * Unit Cost))
        const annualDemand = forecast.averageDailyUsage * 365;
        const orderCost = 50; // Fixed ordering cost assumption ($50 per order)
        const holdingCostPercent = 0.25; // Assume 25% annual holding cost

        let economicOrderQuantity = forecast.recommendedReorderQuantity; // Default to recommended amount

        if (costPrice > 0) {
          // Calculate EOQ using simplified formula
          economicOrderQuantity = Math.ceil(
            Math.sqrt((2 * annualDemand * orderCost) / (holdingCostPercent * costPrice))
          );
        }

        // Determine priority based on days remaining
        let priority = 'LOW';
        if (forecast.daysRemaining <= 7) {
          priority = 'HIGH';
        } else if (forecast.daysRemaining <= 14) {
          priority = 'MEDIUM';
        }

        // Calculate optimal order date (current date + days remaining - lead time)
        const optimalOrderDate = new Date();
        const daysUntilOrder = Math.max(0, forecast.daysRemaining - leadTimeDays);
        optimalOrderDate.setDate(optimalOrderDate.getDate() + daysUntilOrder);

        // Find the most recent order date from transactions
        const orderDate = new Date();
        orderDate.setMonth(orderDate.getMonth() - 2); // Example placeholder, in reality this would come from actual order history

        return {
          ...forecast,
          costPrice,
          leadTimeDays,
          economicOrderQuantity,
          priority,
          optimalOrderDate,
          lastOrdered: orderDate,
          stockoutRisk: this.calculateStockoutRisk(forecast, leadTimeDays),
        };
      })
      .sort((a, b) => {
        // Sort by priority first (HIGH, MEDIUM, LOW)
        if (a.priority !== b.priority) {
          return a.priority === 'HIGH'
            ? -1
            : a.priority === 'MEDIUM'
              ? b.priority === 'HIGH'
                ? 1
                : -1
              : 1;
        }
        // Then by days remaining (ascending)
        return a.daysRemaining - b.daysRemaining;
      });

    return suggestions;
  }

  /**
   * Calculate the risk of stockout based on usage trends and lead time
   * @param forecast The product forecast
   * @param leadTimeDays Product lead time in days
   * @returns Risk level as string: 'HIGH', 'MEDIUM', or 'LOW'
   */
  private calculateStockoutRisk(forecast: InventoryForecast, leadTimeDays: number): string {
    // If we're already below the reorder point, risk is high
    if (forecast.currentStock < forecast.reorderPoint) {
      return 'HIGH';
    }

    // If we have less than (lead time + 3 days) of stock, there's medium risk
    if (forecast.daysRemaining <= leadTimeDays + 3) {
      return 'MEDIUM';
    }

    // If usage is increasing, raise the risk level
    if (forecast.usageTrend === 'INCREASING' && forecast.daysRemaining <= leadTimeDays * 2) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Get low stock alerts for products that need immediate attention
   * Low stock is defined as products below their reorder point
   */
  async getLowStockAlerts() {
    const allForecasts = await this.getInventoryForecasts();

    // Filter for all low stock items
    const lowStockItems = allForecasts.filter((forecast) => forecast.isLow);

    // Get all products data to get more details
    const productIds = lowStockItems.map((item) => item.productId);
    const products = await this.productRepository.findBy({
      id: In(productIds),
    });

    // Create a map for quick lookups
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Create alerts with additional context
    return lowStockItems
      .map((item) => {
        const product = productMap.get(item.productId);
        const leadTimeDays = product?.leadTimeDays || 14; // Default to 2 weeks if not specified

        // Calculate days until order must be placed (days remaining - lead time)
        const daysUntilOrder = Math.max(0, item.daysRemaining - leadTimeDays);

        // Calculate the severity (based on many factors)
        let severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';

        if (item.daysRemaining <= 3) {
          severity = 'CRITICAL';
        } else if (item.daysRemaining <= 7) {
          severity = 'WARNING';
        }

        // If depletion is expected before new stock could arrive, escalate
        if (daysUntilOrder <= 0) {
          severity = 'CRITICAL';
        }

        return {
          productId: item.productId,
          productName: item.productName,
          currentStock: item.currentStock,
          minimumStock: item.reorderPoint,
          daysRemaining: item.daysRemaining,
          avgDailyUsage: item.averageDailyUsage,
          lastUpdated: new Date(),
          severity,
          leadTimeDays,
          daysUntilOrder,
          suggestedOrderQuantity: item.recommendedReorderQuantity,
        };
      })
      .sort((a, b) => {
        // Sort by severity first
        if (a.severity !== b.severity) {
          return a.severity === 'CRITICAL'
            ? -1
            : a.severity === 'WARNING'
              ? b.severity === 'CRITICAL'
                ? 1
                : -1
              : 1;
        }
        // Then by days remaining
        return a.daysRemaining - b.daysRemaining;
      });
  }

  /**
   * Get inventory optimization metrics including turnover rate and holding costs
   */
  async getOptimizationMetrics() {
    // Get forecasts for all products
    const allForecasts = await this.getInventoryForecasts();

    // Get all active products
    const products = await this.productRepository.find({
      where: { isActive: true },
    });

    // Map products by ID for easier lookup
    const forecastMap = new Map(allForecasts.map((forecast) => [forecast.productId, forecast]));

    // Calculate the total inventory value
    let totalInventoryValue = 0;
    let totalAnnualUsageValue = 0;
    let totalStockoutRisk = 0;

    // Get current date
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // For each product, calculate metrics
    for (const product of products) {
      // Skip products with no cost price
      if (!product.costPrice) continue;

      // Get the forecast
      const forecast = forecastMap.get(product.id);

      if (forecast) {
        // Calculate inventory value
        const inventoryValue = forecast.currentStock * product.costPrice;
        totalInventoryValue += inventoryValue;

        // Calculate annual usage value
        const annualUsage = forecast.averageDailyUsage * 365;
        const annualUsageValue = annualUsage * product.costPrice;
        totalAnnualUsageValue += annualUsageValue;

        // Calculate stockout risk factor (0-100)
        const risk = forecast.isLow
          ? forecast.daysRemaining <= 7
            ? 100
            : 50
          : forecast.averageDailyUsage > 0
            ? 25
            : 0;
        totalStockoutRisk += risk;
      }
    }

    // Calculate the turnover rate (annual usage value / average inventory value)
    // A higher turnover rate is better (more efficient use of inventory)
    const inventoryTurnoverRate =
      totalInventoryValue > 0 ? totalAnnualUsageValue / totalInventoryValue : 0;

    // Calculate annual holding cost (assume 25% of inventory value per year)
    const annualHoldingCost = totalInventoryValue * 0.25;

    // Calculate average stockout risk
    const averageStockoutRisk = products.length > 0 ? totalStockoutRisk / products.length : 0;

    // Calculate potential savings
    // If inventory turnover improved by 20%, how much would be saved
    const potentialSavings = annualHoldingCost * 0.2;

    return {
      inventoryTurnoverRate: inventoryTurnoverRate.toFixed(2),
      annualHoldingCost: annualHoldingCost.toFixed(2),
      totalInventoryValue: totalInventoryValue.toFixed(2),
      averageStockoutRisk: Math.min(100, averageStockoutRisk).toFixed(2),
      potentialSavings: potentialSavings.toFixed(2),
      stockHealthScore: Math.max(0, 100 - Math.min(100, averageStockoutRisk)).toFixed(2),
      totalProducts: products.length,
      lowStockProducts: allForecasts.filter((f) => f.isLow).length,
      sufficientStockProducts: allForecasts.filter((f) => !f.isLow).length,
      excessStockProducts: allForecasts.filter((f) => f.daysRemaining > 45).length,
    };
  }

  /**
   * Get historical usage trend data for a specific product
   * Analyzes transaction history to provide daily, weekly, and monthly usage patterns
   * @param productId ID of the product to analyze
   * @param period Number of days to look back
   */
  async getUsageTrend(productId: string, period: number = 90) {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Get date range for the period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    // Get all OUT transactions in the period
    const transactions = await this.transactionRepository.find({
      where: {
        productId,
        type: TransactionType.OUT,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    // Prepare data structures for different time frames
    const dailyUsage: Record<string, number> = {};
    const weeklyUsage: Record<string, number> = {};
    const monthlyUsage: Record<string, number> = {};

    // Calculate daily usage
    for (const tx of transactions) {
      const date = tx.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const week = this.getWeekNumber(tx.createdAt);
      const month = tx.createdAt.toISOString().substring(0, 7); // YYYY-MM

      // Update daily usage
      if (!dailyUsage[date]) {
        dailyUsage[date] = 0;
      }
      dailyUsage[date] += Number(tx.quantity);

      // Update weekly usage
      if (!weeklyUsage[week]) {
        weeklyUsage[week] = 0;
      }
      weeklyUsage[week] += Number(tx.quantity);

      // Update monthly usage
      if (!monthlyUsage[month]) {
        monthlyUsage[month] = 0;
      }
      monthlyUsage[month] += Number(tx.quantity);
    }

    // Convert to arrays for charting
    const dailyData = Object.entries(dailyUsage).map(([date, quantity]) => ({
      date,
      quantity: Number(quantity),
    }));

    const weeklyData = Object.entries(weeklyUsage).map(([week, quantity]) => ({
      week,
      quantity: Number(quantity),
    }));

    const monthlyData = Object.entries(monthlyUsage).map(([month, quantity]) => ({
      month,
      quantity: Number(quantity),
    }));

    // Calculate total and average usage
    const totalUsage = transactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);
    const averageDailyUsage = period > 0 ? totalUsage / period : 0;

    // Calculate trend (increasing, decreasing, or stable)
    const midpoint = new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2);

    const earlierTransactions = transactions.filter((tx) => tx.createdAt < midpoint);
    const recentTransactions = transactions.filter((tx) => tx.createdAt >= midpoint);

    const earlierUsage = earlierTransactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);
    const recentUsage = recentTransactions.reduce((sum, tx) => sum + Number(tx.quantity), 0);

    let trend = 'STABLE';
    if (recentUsage > earlierUsage * 1.2) {
      // 20% increase
      trend = 'INCREASING';
    } else if (recentUsage < earlierUsage * 0.8) {
      // 20% decrease
      trend = 'DECREASING';
    }

    // Calculate seasonality by analyzing weekly patterns
    const weekdayUsage = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    for (const tx of transactions) {
      const day = tx.createdAt.getDay();
      weekdayUsage[day] += Number(tx.quantity);
    }

    // Check if specific days have significantly higher usage
    const avgWeekdayUsage = weekdayUsage.reduce((a, b) => a + b, 0) / 7;
    const peakDays = weekdayUsage
      .map((usage, index) => ({ day: index, usage }))
      .filter(({ usage }) => usage > avgWeekdayUsage * 1.25) // 25% above average
      .map(({ day }) => this.getDayName(day));

    // Prepare forecast for the next period
    const forecastData: Array<{ date: string; quantity: number }> = [];
    let runningAvg = averageDailyUsage;

    // Apply trend to forecast
    if (trend === 'INCREASING') {
      runningAvg *= 1.1; // Increase by 10%
    } else if (trend === 'DECREASING') {
      runningAvg *= 0.9; // Decrease by 10%
    }

    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      // Forecast next 30 days
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      // Apply some randomness and weekday patterns
      let adjustedQty = runningAvg * (0.85 + Math.random() * 0.3); // 85-115% of average

      // If it's a peak day, increase usage
      if (peakDays.includes(this.getDayName(forecastDate.getDay()))) {
        adjustedQty *= 1.2; // 20% higher on peak days
      }

      forecastData.push({
        date: forecastDate.toISOString().split('T')[0],
        quantity: Math.round(adjustedQty * 100) / 100,
      });
    }

    return {
      productId,
      productName: product.name,
      period,
      totalUsage,
      averageDailyUsage,
      trend,
      peakDays,
      dailyData,
      weeklyData,
      monthlyData,
      forecast: forecastData,
    };
  }

  /**
   * Helper function to get the week number in format YYYY-WW
   */
  private getWeekNumber(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week =
      Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7) + 1;
    return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Helper function to get day name from day index
   */
  private getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }
}
