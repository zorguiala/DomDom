import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StockBatchService } from './services/stock-batch.service';

interface CreateStockBatchDto {
  productId: string;
  quantity: number;
  batchNumber: string;
  expiryDate?: Date;
  notes?: string;
  unitCost?: number;
}

@Controller('stock/batches')
@UseGuards(JwtAuthGuard)
export class StockBatchController {
  constructor(private readonly batchService: StockBatchService) {}

  @Post()
  async create(@Body() createBatchDto: CreateStockBatchDto) {
    return await this.batchService.createBatch(createBatchDto);
  }

  @Get()
  async findAll(
    @Query('productId') productId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('expiryDateFrom') expiryDateFrom?: string,
    @Query('expiryDateTo') expiryDateTo?: string
  ) {
    const expiryFrom = expiryDateFrom ? new Date(expiryDateFrom) : undefined;
    const expiryTo = expiryDateTo ? new Date(expiryDateTo) : undefined;
    
    return this.batchService.findAll(
      productId, 
      isActive !== undefined ? isActive === true : undefined,
      expiryFrom,
      expiryTo
    );
  }

  @Get('expiring')
  async getExpiringBatches(@Query('daysThreshold', ParseIntPipe) daysThreshold = 30) {
    return this.batchService.getExpiringBatches(daysThreshold);
  }

  @Get('expired')
  async getExpiredBatches() {
    return this.batchService.getExpiringBatches(0);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<any>) {
    return this.batchService.update(id, updateData);
  }

  @Patch(':id/quantity')
  async updateQuantity(
    @Param('id') id: string, 
    @Body('quantityChange') quantityChange: number
  ) {
    return this.batchService.updateBatchQuantity(id, quantityChange);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.batchService.remove(id);
  }
}
