import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockTransactionService } from './services/stock-transaction.service';
import { StockTransactionType } from './types/stock.types';

interface CreateStockTransactionDto {
  stockItemId: string;
  type: StockTransactionType;
  quantity: number;
  unitPrice: number;
  reference?: string;
  notes?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdById: string;
}

@ApiTags('stock-transactions')
@Controller('stock-transactions')
@UseGuards(JwtAuthGuard)
export class StockTransactionController {
  constructor(private readonly stockTransactionService: StockTransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async createTransaction(@Body() createDto: CreateStockTransactionDto) {
    return this.stockTransactionService.createTransaction(createDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple stock transactions in bulk' })
  @ApiResponse({ status: 201, description: 'Transactions created successfully' })
  async createBulkTransactions(@Body() createDtos: CreateStockTransactionDto[]) {
    return this.stockTransactionService.createBulkTransactions(createDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock transactions with optional filtering' })
  @ApiResponse({ status: 200, description: 'Returns filtered transactions' })
  async getTransactions(
    @Query('productId') productId?: string,
    @Query('type') type?: StockTransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters: any = {};

    if (productId) filters.productId = productId;
    if (type) filters.type = type;

    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }

    return this.stockTransactionService.getTransactions(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock transaction by ID' })
  @ApiResponse({ status: 200, description: 'Returns the transaction' })
  async getTransactionById(@Param('id') id: string) {
    return this.stockTransactionService.getTransactionById(id);
  }
}
