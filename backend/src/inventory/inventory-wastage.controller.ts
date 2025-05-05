import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryWastageService } from './services/inventory-wastage.service';
import { CreateWastageRecordDto } from './dto/create-wastage-record.dto';
import { WastageReason } from '../entities/inventory-wastage.entity';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('inventory/wastage')
@UseGuards(JwtAuthGuard)
export class InventoryWastageController {
  constructor(private readonly wastageService: InventoryWastageService) {}

  @Post()
  async create(@Body() createWastageDto: CreateWastageRecordDto, @Request() req: RequestWithUser) {
    return this.wastageService.create(createWastageDto, req.user);
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('productId') productId?: string,
    @Query('reason') reason?: WastageReason
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.wastageService.findAll(start, end, productId, reason);
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

  @Get('summary/product')
  async getWastageByProduct(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate are required');
    }

    return this.wastageService.getWastageByProduct(new Date(startDate), new Date(endDate));
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
}
