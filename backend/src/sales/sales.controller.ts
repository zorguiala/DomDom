import { Controller, Post, Body, Get, Query, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { SaleReportFilterDto, SaleReportDto } from '../types/sale.types';
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

  @Put(':id')
  @ApiOperation({ summary: 'Update a sale' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200 })
  async updateSale(@Param('id') id: string, @Body() dto: UpdateSaleDto) {
    return await this.salesService.updateSale(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200 })
  async deleteSale(@Param('id') id: string) {
    return await this.salesService.deleteSale(id);
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily sales for a specific date' })
  @ApiParam({ name: 'date', required: true, description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200 })
  async getDailySales(@Param('date') date: string) {
    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Create start and end of the requested day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return await this.salesService.getDailySales(startDate, endDate);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get sales overview data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in ISO format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in ISO format' })
  @ApiResponse({ status: 200 })
  async getSalesOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    let start: Date;
    let end: Date;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new Error('Invalid startDate format');
      }
    } else {
      // Default to 30 days ago
      start = new Date();
      start.setDate(start.getDate() - 30);
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new Error('Invalid endDate format');
      }
    } else {
      // Default to today
      end = new Date();
    }

    return await this.salesService.getSalesOverview(start, end);
  }
}
