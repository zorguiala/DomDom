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
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';

interface LowStockAlert {
  isLow: boolean;
  currentStock: number;
  minimumStock: number;
  product: Product;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: Partial<Product>): Promise<Product> {
    if (!data.name || !data.sku || !data.unit) {
      throw new BadRequestException('Name, SKU and unit are required');
    }
    return this.productService.create(data);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isRawMaterial') isRawMaterialStr?: string,
    @Query('isActive') isActiveStr?: string
  ): Promise<Product[]> {
    // Convert string query parameters to boolean if present
    const isRawMaterial =
      isRawMaterialStr !== undefined ? isRawMaterialStr.toLowerCase() === 'true' : undefined;

    const isActive = isActiveStr !== undefined ? isActiveStr.toLowerCase() === 'true' : true;

    return this.productService.findAll(search, isRawMaterial, isActive);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: Partial<Product>): Promise<Product> {
    return this.productService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productService.remove(id);
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string): Promise<Product | null> {
    return this.productService.findBySku(sku);
  }

  @Get(':id/stock-history')
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

    return this.productService.getStockHistory(id, startDate, endDate);
  }

  @Get(':id/low-stock-alert')
  async getLowStockAlert(@Param('id', ParseUUIDPipe) id: string): Promise<LowStockAlert> {
    return this.productService.checkLowStockAlert(id);
  }

  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string): Promise<Product | null> {
    const product = await this.productService.findByBarcode(barcode);
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }

  @Put(':id/barcode')
  async updateBarcode(@Param('id', ParseUUIDPipe) id: string, @Body('barcode') barcode: string): Promise<Product> {
    if (!barcode) {
      throw new BadRequestException('Barcode is required');
    }
    return this.productService.updateBarcode(id, barcode);
  }
}
