import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockCountService } from './services/stock-count.service';
import { GetUser } from '../common/decorators/get-user.decorator';

interface CreateStockCountDto {
  name: string;
  countDate: Date;
  notes?: string;
  createdById: string;
}

interface StockCountItemDto {
  productId: string;
  expectedQuantity: number;
  actualQuantity?: number;
  notes?: string;
}

@ApiTags('stock-counts')
@Controller('stock-counts')
@UseGuards(JwtAuthGuard)
export class StockCountController {
  constructor(private readonly stockCountService: StockCountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock count' })
  @ApiResponse({ status: 201, description: 'Stock count created successfully' })
  async createStockCount(@Body() createDto: CreateStockCountDto, @GetUser('id') userId: string) {
    return this.stockCountService.createStockCount({
      ...createDto,
      createdById: userId,
    });
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add items to a stock count' })
  @ApiResponse({ status: 201, description: 'Items added successfully' })
  async addItemsToStockCount(
    @Param('id') stockCountId: string,
    @Body() items: StockCountItemDto[]
  ) {
    return this.stockCountService.addItemsToStockCount(stockCountId, items);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start a stock count' })
  @ApiResponse({ status: 200, description: 'Stock count started successfully' })
  async startStockCount(@Param('id') stockCountId: string) {
    return this.stockCountService.startStockCount(stockCountId);
  }

  @Put(':id/record')
  @ApiOperation({ summary: 'Record actual quantities for a stock count' })
  @ApiResponse({ status: 200, description: 'Quantities recorded successfully' })
  async recordActualQuantities(
    @Param('id') stockCountId: string,
    @Body() items: { productId: string; actualQuantity: number; notes?: string }[]
  ) {
    return this.stockCountService.recordActualQuantities(stockCountId, items);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete a stock count' })
  @ApiResponse({ status: 200, description: 'Stock count completed successfully' })
  async completeStockCount(@Param('id') stockCountId: string) {
    return this.stockCountService.completeStockCount(stockCountId);
  }

  @Put(':id/reconcile')
  @ApiOperation({ summary: 'Reconcile a stock count' })
  @ApiResponse({ status: 200, description: 'Stock count reconciled successfully' })
  async reconcileStockCount(@Param('id') stockCountId: string, @GetUser('id') userId: string) {
    return this.stockCountService.reconcileStockCount(stockCountId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock counts' })
  @ApiResponse({ status: 200, description: 'Returns all stock counts' })
  async getAllStockCounts() {
    return this.stockCountService.getAllStockCounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock count by ID' })
  @ApiResponse({ status: 200, description: 'Returns the stock count' })
  async getStockCountById(@Param('id') id: string) {
    return this.stockCountService.getStockCountById(id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get items for a stock count' })
  @ApiResponse({ status: 200, description: 'Returns stock count items' })
  async getStockCountItems(@Param('id') stockCountId: string) {
    return this.stockCountService.getStockCountItems(stockCountId);
  }
}
