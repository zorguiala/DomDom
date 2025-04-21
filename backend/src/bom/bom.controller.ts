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
import { BOMService } from './bom.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBOMDto, UpdateBOMDto } from './dto/bom.dto';

@Controller('bom')
@UseGuards(JwtAuthGuard)
export class BOMController {
  constructor(private readonly bomService: BOMService) {}

  @Post()
  async create(@Request() req, @Body() createBomDto: CreateBOMDto) {
    return this.bomService.create(createBomDto, req.user);
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.bomService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bomService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBomDto: UpdateBOMDto) {
    return this.bomService.update(id, updateBomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bomService.remove(id);
  }

  @Get(':id/material-requirements')
  async getMaterialRequirements(@Param('id') id: string, @Query('quantity') quantity: string) {
    if (!quantity) {
      throw new BadRequestException('Quantity parameter is required');
    }

    return this.bomService.calculateMaterialRequirements(id, parseFloat(quantity));
  }

  @Get(':id/availability')
  async checkAvailability(@Param('id') id: string, @Query('quantity') quantity: string) {
    if (!quantity) {
      throw new BadRequestException('Quantity parameter is required');
    }

    return this.bomService.checkAvailability(id, parseFloat(quantity));
  }

  @Get(':id/cost')
  async calculateCost(@Param('id') id: string, @Query('quantity') quantity: string) {
    if (!quantity) {
      throw new BadRequestException('Quantity parameter is required');
    }

    return this.bomService.calculateProductionCost(id, parseFloat(quantity));
  }
}
