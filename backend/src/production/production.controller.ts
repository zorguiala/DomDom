import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  RecordProductionOutputDto,
} from './dto/production-order.dto';
import { ProductionOrderStatus } from '../entities/production-order.entity';

@Controller('production-orders')
@UseGuards(JwtAuthGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  async createProductionOrder(@Request() req, @Body() dto: CreateProductionOrderDto) {
    return this.productionService.createProductionOrder(dto, req.user);
  }

  @Get()
  async findAll(@Query('status') status?: ProductionOrderStatus) {
    return this.productionService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.productionService.update(id, dto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductionOrderStatusDto,
    @Request() req
  ) {
    return this.productionService.updateStatus(id, dto, req.user);
  }

  @Post(':id/output')
  async recordProduction(
    @Param('id') id: string,
    @Body() dto: RecordProductionOutputDto,
    @Request() req
  ) {
    return this.productionService.recordProduction(id, dto, req.user);
  }

  @Get(':id/progress')
  async getProductionProgress(@Param('id') id: string) {
    return this.productionService.getProductionOrderProgress(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productionService.delete(id);
  }
}
