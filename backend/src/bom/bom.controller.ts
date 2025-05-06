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
import { MaterialRequirementsDto, MaterialCostDto } from '../types/bomCalculation.dto';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

interface AvailabilityCheck {
  isAvailable: boolean;
  shortages: Array<{
    product: any;
    required: number;
    available: number;
    shortage: number;
    unit: string;
  }>;
}

interface ProductionCost {
  materialCost: number;
  totalCost: number;
  costBreakdown: Array<{
    product: any;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }>;
}

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

  /**
   * Calculate material requirements for a BOM and quantity
   */
  @Get(':id/material-requirements')
  @ApiOperation({ summary: 'Calculate material requirements for a BOM and quantity' })
  @ApiParam({ name: 'id', description: 'BOM ID' })
  @ApiQuery({ name: 'quantity', required: true, type: Number })
  @ApiResponse({ status: 200, type: MaterialRequirementsDto })
  async getMaterialRequirements(
    @Param('id') id: string,
    @Query('quantity') quantity: number
  ): Promise<MaterialRequirementsDto> {
    return this.bomService.calculateMaterialRequirements(id, Number(quantity));
  }

  /**
   * Calculate material cost for a BOM and quantity
   */
  @Get(':id/cost')
  @ApiOperation({ summary: 'Calculate material cost for a BOM and quantity' })
  @ApiParam({ name: 'id', description: 'BOM ID' })
  @ApiQuery({ name: 'quantity', required: true, type: Number })
  @ApiResponse({ status: 200, type: MaterialCostDto })
  async getMaterialCost(
    @Param('id') id: string,
    @Query('quantity') quantity: number
  ): Promise<MaterialCostDto> {
    return this.bomService.calculateMaterialCost(id, Number(quantity));
  }

  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
    @Query('quantity') quantity: string
  ): Promise<AvailabilityCheck> {
    if (!quantity) {
      throw new BadRequestException('Quantity parameter is required');
    }

    return this.bomService.checkAvailability(id, parseFloat(quantity));
  }

  @Get(':id/cost')
  async calculateCost(
    @Param('id') id: string,
    @Query('quantity') quantity: string
  ): Promise<ProductionCost> {
    if (!quantity) {
      throw new BadRequestException('Quantity parameter is required');
    }

    return this.bomService.calculateProductionCost(id, parseFloat(quantity));
  }
}
