import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionType } from '../entities/inventory-transaction.entity';
import { BatchInventoryDto } from './dto/batch-inventory.dto';
import { BarcodeScanDto } from './dto/barcode-scan.dto';
import { StockReportItem, InventoryValuation } from './types/inventory.types';
import { InventoryTransactionService } from './services/inventory-transaction.service';
import { InventoryStockService } from './services/inventory-stock.service';
import { InventoryAnalyticsService } from './services/inventory-analytics.service';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly transactionService: InventoryTransactionService,
    private readonly stockService: InventoryStockService,
    private readonly analyticsService: InventoryAnalyticsService
  ) {}

  @Post('transaction')
  async recordTransaction(
    @Body('productId') productId: string,
    @Body('type') type: TransactionType,
    @Body('quantity', ParseFloatPipe) quantity: number,
    @Body('unitPrice', ParseFloatPipe) unitPrice: number,
    @Request() req: RequestWithUser,
    @Body('reference') reference?: string,
    @Body('notes') notes?: string
  ) {
    if (!productId || !type || !quantity || !unitPrice) {
      throw new BadRequestException('Missing required fields');
    }

    return this.transactionService.create(
      {
        productId,
        type,
        quantity,
        unitPrice,
        reference,
        notes,
      },
      req.user
    );
  }

  @Get('transactions')
  async getTransactions(
    @Query('productId') productId?: string,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
    }

    return this.transactionService.findAll(startDate, endDate, type, productId);
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('threshold') thresholdRaw?: string) {
    let threshold: number | undefined = undefined;
    if (thresholdRaw !== undefined && thresholdRaw !== '') {
      const parsed = parseInt(thresholdRaw, 10);
      if (isNaN(parsed)) {
        throw new BadRequestException('Threshold must be a number');
      }
      threshold = parsed;
    }
    return this.stockService.getLowStockProducts(threshold);
  }

  @Get('report')
  async getStockReport(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string
  ): Promise<StockReportItem[]> {
    if (!startDateStr || !endDateStr) {
      throw new BadRequestException('Start date and end date are required');
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.analyticsService.getStockReport(startDate, endDate);
  }

  @Post('batch')
  async processBatchTransactions(
    @Body() batchDto: BatchInventoryDto,
    @Request() req: RequestWithUser
  ) {
    return this.transactionService.processBatchTransactions(batchDto, req.user);
  }

  @Post('barcode-scan')
  async processBarcodeScan(
    @Body() barcodeScanDto: BarcodeScanDto,
    @Request() req: RequestWithUser
  ) {
    return this.transactionService.processBarcodeScan(barcodeScanDto, req.user);
  }

  @Get('valuation')
  async getInventoryValuation(): Promise<InventoryValuation[]> {
    return this.analyticsService.getInventoryValuation();
  }

  @Get('adjustments')
  async getStockAdjustmentHistory(
    @Query('productId') productId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
    }

    return this.transactionService.findAll(
      startDate,
      endDate,
      TransactionType.ADJUSTMENT,
      productId
    );
  }

  @Get('low-stock-alerts')
  async getLowStockAlerts(@Query('threshold', ParseIntPipe) threshold?: number) {
    return this.stockService.getLowStockAlerts(threshold);
  }

  @Get('status')
  async getInventoryStatus() {
    return this.stockService.getInventoryStatus();
  }

  @Get('stats')
  async getInventoryStats() {
    return this.analyticsService.getInventoryStats();
  }
}
