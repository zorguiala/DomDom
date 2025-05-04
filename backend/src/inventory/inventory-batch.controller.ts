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
  BadRequestException,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryBatchService } from './services/inventory-batch.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('inventory/batches')
@UseGuards(JwtAuthGuard)
export class InventoryBatchController {
  constructor(private readonly batchService: InventoryBatchService) {}

  @Post()
  async create(@Body() createBatchDto: CreateInventoryBatchDto, @Request() req: RequestWithUser) {
    return this.batchService.create(createBatchDto, req.user);
  }

  @Get()
  async findAll(@Query('productId') productId?: string) {
    return this.batchService.findAll(productId);
  }

  @Get('status')
  async getBatchInventoryStatus() {
    return this.batchService.getBatchInventoryStatus();
  }

  @Get('expiring')
  async getExpiringBatches(@Query('daysThreshold', ParseIntPipe) daysThreshold = 30) {
    return this.batchService.getExpiringBatches(daysThreshold);
  }

  @Get('expired')
  async getExpiredBatches() {
    return this.batchService.getExpiredBatches();
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
