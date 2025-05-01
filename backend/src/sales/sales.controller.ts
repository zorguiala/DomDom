import { Controller, Post, Body, Get, Query, Param, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, SaleReportFilterDto, SaleReportDto } from '../types/sale.types';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201 })
  async createSale(@Body() dto: CreateSaleDto) {
    return await this.salesService.createSale(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales with filtering, pagination, and sorting' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false, description: 'ASC or DESC' })
  @ApiResponse({ status: 200 })
  async listSales(
    @Query() query: { page?: number; limit?: number; search?: string; sort?: string }
  ) {
    return await this.salesService.listSales(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale details' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200 })
  async getSale(@Param('id') id: string) {
    return await this.salesService.getSale(id);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get sales report (filterable)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'customerName', required: false })
  @ApiResponse({ status: 200, type: SaleReportDto })
  async getSalesReport(@Query() filter: SaleReportFilterDto) {
    return await this.salesService.getSalesReport(filter);
  }
}
