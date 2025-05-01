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
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';
import { LowStockAlert } from '../types/product.types';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: Product })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({ status: 200, description: 'List of products', type: [Product] })
  async findAll(@Query() query: QueryProductDto): Promise<Product[]> {
    return this.productsService.findAll(query.search, query.isRawMaterial, query.isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: Product })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiResponse({ status: 200, description: 'Product marked as inactive' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Find a product by SKU' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  async findBySku(@Param('sku') sku: string): Promise<Product> {
    const product = await this.productsService.findBySku(sku);
    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }
    return product;
  }

  @Get(':id/stock-history')
  @ApiOperation({ summary: 'Get stock history for a product' })
  @ApiResponse({ status: 200, description: 'Stock history', type: [InventoryTransaction] })
  async getStockHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ): Promise<InventoryTransaction[]> {
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

    return this.productsService.getStockHistory(id, startDate, endDate);
  }

  @Get(':id/low-stock-alert')
  @ApiOperation({ summary: 'Get low stock alert status for a product' })
  @ApiResponse({
    status: 200,
    description: 'Low stock alert information',
    type: LowStockAlert,
  })
  async getLowStockAlert(@Param('id', ParseUUIDPipe) id: string): Promise<LowStockAlert> {
    return this.productsService.checkLowStockAlert(id);
  }

  @Put(':id/barcode')
  @ApiOperation({ summary: 'Update product barcode' })
  @ApiResponse({ status: 200, description: 'Barcode updated successfully', type: Product })
  async updateBarcode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBarcodeDto: UpdateBarcodeDto
  ): Promise<Product> {
    const updatedProduct = await this.productsService.updateBarcode(id, updateBarcodeDto.barcode);
    return updatedProduct;
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Find a product by barcode' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  async findByBarcode(@Param('barcode') barcode: string): Promise<Product> {
    const product = await this.productsService.findByBarcode(barcode);
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }
}
