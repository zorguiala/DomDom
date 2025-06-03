import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  private readonly logger = new Logger(StockController.name);

  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock items with optional filtering' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'batchNumber', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all stock items matching the criteria' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('productId') productId?: string,
    @Query('location') location?: string,
    @Query('batchNumber') batchNumber?: string,
  ) {
    const where: Prisma.StockItemWhereInput = {};
    
    if (productId) {
      where.productId = productId;
    }
    
    if (location) {
      where.location = location;
    }
    
    if (batchNumber) {
      where.batchNumber = batchNumber;
    }

    return this.stockService.findAllStockItems({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get all items with stock below minimum level' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all low stock items' })
  async getLowStock() {
    return this.stockService.getLowStockItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock item by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the stock item' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stock item not found' })
  async findOne(@Param('id') id: string) {
    return this.stockService.findStockItemById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new stock item' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Stock item created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createStockItemDto: Prisma.StockItemCreateInput) {
    return this.stockService.createStockItem(createStockItemDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a stock item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock item updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stock item not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() updateStockItemDto: Prisma.StockItemUpdateInput,
  ) {
    return this.stockService.updateStockItem(id, updateStockItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stock item' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Stock item deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stock item not found' })
  async remove(@Param('id') id: string) {
    await this.stockService.deleteStockItem(id);
    return;
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer stock between locations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock transferred successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid transfer request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stock item not found' })
  async transferStock(
    @Body() transferData: {
      fromStockItemId: string;
      toStockItemId?: string;
      productId: string;
      quantity: number;
      newLocation?: string;
      notes?: string;
    },
  ) {
    return this.stockService.transferStock(transferData);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock items by product ID' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns stock items for the product' })
  async findByProduct(@Param('productId') productId: string) {
    return this.stockService.findStockItemsByProductId(productId);
  }

  @Get('product/:productId/quantity')
  @ApiOperation({ summary: 'Get total quantity of a product in stock' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the total quantity' })
  async getProductQuantity(@Param('productId') productId: string) {
    const quantity = await this.stockService.getProductTotalQuantity(productId);
    return { productId, quantity };
  }
}
