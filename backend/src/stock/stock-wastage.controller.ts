import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockWastageService } from './services/stock-wastage.service';
import { WastageReason } from '../entities/stock-wastage.entity';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

interface CreateWastageRecordDto {
  stockItemId: string;
  quantity: number;
  reason: WastageReason;
  date: Date;
  notes?: string;
}

@Controller('stock/wastage')
@UseGuards(JwtAuthGuard)
export class StockWastageController {
  constructor(private readonly wastageService: StockWastageService) {}

  @Post()
  async create(@Body() createWastageDto: CreateWastageRecordDto, @Request() req: RequestWithUser) {
    return this.wastageService.create(createWastageDto, req.user);
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockItemId') stockItemId?: string,
    @Query('reason') reason?: WastageReason
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.wastageService.findAll({
      startDate: start,
      endDate: end,
      stockItemId,
      reason
    });
  }

  @Get('summary/reason')
  async getWastageSummaryByReason(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate are required');
    }

    return this.wastageService.getWastageSummaryByReason(new Date(startDate), new Date(endDate));
  }

  @Get('summary/stock-item')
  async getWastageByStockItem(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate are required');
    }

    return this.wastageService.getWastageByStockItem(new Date(startDate), new Date(endDate));
  }

  @Get('analytics')
  async getWastageAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const end = endDate ? new Date(endDate) : new Date();

    return this.wastageService.getWastageAnalytics(start, end);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wastageService.findOne(id);
  }
  
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.wastageService.remove(id);
  }
}
