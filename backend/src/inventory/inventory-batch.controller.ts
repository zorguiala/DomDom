import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryBatchService } from './services/inventory-batch.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';

@Controller('inventory/batches')
@UseGuards(JwtAuthGuard)
export class InventoryBatchController {
  constructor(private readonly batchService: InventoryBatchService) {}

  @Post()
  async create(@Body() createBatchDto: CreateInventoryBatchDto) {
    return await this.batchService.createBatch(createBatchDto);
  }

  @Get()
  async findAll(@Query('productId') productId?: string) {
    return this.batchService.findAll(productId);
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.batchService.remove(id);
  }
}
