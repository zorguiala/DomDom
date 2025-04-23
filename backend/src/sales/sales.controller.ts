import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DirectSaleDto } from './dto/direct-sale.dto';
import { AgentAssignmentDto, AgentReturnDto } from './dto/commercial-sale.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('direct')
  async createDirectSale(@Request() req, @Body() data: DirectSaleDto) {
    return this.salesService.createDirectSale(data, req.user);
  }

  @Post('commercial/assign')
  async createCommercialAssignment(@Request() req, @Body() data: AgentAssignmentDto) {
    return this.salesService.createCommercialAssignment(data, req.user);
  }

  @Post('commercial/return')
  async processCommercialReturn(@Request() req, @Body() data: AgentReturnDto) {
    return this.salesService.processCommercialReturn(data, req.user);
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if ((startDate && !end) || (!startDate && end)) {
      throw new BadRequestException('Both startDate and endDate must be provided together');
    }

    return this.salesService.findAll(start, end, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get(':id/invoice')
  async generateInvoice(@Param('id') id: string) {
    return this.salesService.generateInvoice(id);
  }

  @Get('reports/sales')
  async getSalesReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.salesService.getSalesReport(new Date(startDate), new Date(endDate));
  }

  @Get('reports/top-products')
  async getTopProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.salesService.getTopProducts(
      new Date(startDate),
      new Date(endDate),
      limit ? parseInt(limit, 10) : undefined
    );
  }
}
