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
import { InventoryService } from './inventory.service';
import { TransactionType } from '../entities/inventory-transaction.entity';
import { User } from '../entities/user.entity';
import { BatchInventoryDto } from './dto/batch-inventory.dto';
import { BarcodeScanDto } from './dto/barcode-scan.dto';
import { StockReportItem, InventoryValuation } from './types/inventory.types';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

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

    return this.inventoryService.recordTransaction(
      productId,
      type,
      quantity,
      unitPrice,
      req.user,
      reference,
      notes
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

    return this.inventoryService.getTransactionHistory(productId, type, startDate, endDate);
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('threshold', ParseIntPipe) threshold?: number) {
    return this.inventoryService.getLowStockProducts(threshold);
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

    return this.inventoryService.getStockReport(startDate, endDate);
  }

  @Post('batch')
  async processBatchTransactions(
    @Body() batchDto: BatchInventoryDto,
    @Request() req: RequestWithUser
  ) {
    return this.inventoryService.processBatchTransactions(batchDto, req.user);
  }

  @Post('barcode-scan')
  async processBarcodeScan(
    @Body() barcodeScanDto: BarcodeScanDto,
    @Request() req: RequestWithUser
  ) {
    return this.inventoryService.processBarcodeScan(barcodeScanDto, req.user);
  }

  @Get('valuation')
  async getInventoryValuation(): Promise<InventoryValuation[]> {
    return this.inventoryService.getInventoryValuation();
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

    return this.inventoryService.getStockAdjustmentHistory(productId, startDate, endDate);
  }

  @Get('low-stock-alerts')
  async getLowStockAlerts(@Query('threshold', ParseIntPipe) threshold?: number) {
    return this.inventoryService.getLowStockAlerts(threshold);
  }
}
