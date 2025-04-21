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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: Partial<Product>) {
    if (!data.name || !data.sku || !data.unit) {
      throw new BadRequestException('Name, SKU and unit are required');
    }
    return this.productService.create(data);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isRawMaterial') isRawMaterial?: boolean,
    @Query('isActive') isActive?: boolean
  ) {
    return this.productService.findAll(search, isRawMaterial, isActive);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: Partial<Product>) {
    return this.productService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.remove(id);
    return { message: 'Product deactivated successfully' };
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return this.productService.findBySku(sku);
  }

  @Get(':id/stock-history')
  async getStockHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.productService.getStockHistory(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get(':id/low-stock-alert')
  async getLowStockAlert(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.checkLowStockAlert(id);
  }
}
