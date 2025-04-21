import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { TransactionType } from '../entities/inventory-transaction.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('transaction')
  async recordTransaction(
    @Body('productId') productId: string,
    @Body('type') type: TransactionType,
    @Body('quantity') quantity: number,
    @Body('unitPrice') unitPrice: number,
    @Body('reference') reference: string,
    @Body('notes') notes: string,
    @Request() req,
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
      notes,
    );
  }

  @Get('transactions')
  async getTransactions(
    @Query('productId') productId?: string,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.inventoryService.getTransactionHistory(
      productId,
      type,
      startDate,
      endDate,
    );
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockProducts(threshold);
  }

  @Get('report')
  async getStockReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    return this.inventoryService.getStockReport(startDate, endDate);
  }
}
