import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
  ParseArrayPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryCountService } from './services/inventory-count.service';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { InventoryCountStatus } from '../entities/inventory-count.entity';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

/**
 * Controller for inventory count operations
 * Handles inventory count sessions, reconciliation, and adjustments
 */
@Controller('inventory/counts')
@UseGuards(JwtAuthGuard)
export class InventoryCountController {
  constructor(private readonly countService: InventoryCountService) {}

  /**
   * Create a new inventory count session
   */
  @Post()
  async create(@Body() createCountDto: CreateInventoryCountDto, @Request() req: RequestWithUser) {
    return this.countService.create(createCountDto, req.user);
  }

  /**
   * Get all inventory counts with optional status filter
   */
  @Get()
  async findAll(@Query('status') status?: InventoryCountStatus) {
    return this.countService.findAll(status);
  }

  /**
   * Generate a template for inventory count
   */
  @Get('template')
  async generateTemplate(
    @Query('categoryIds', new ParseArrayPipe({ optional: true })) categoryIds?: string[],
    @Query('includeInactive') includeInactive?: string
  ) {
    const includeInactiveFlag = includeInactive === 'true';
    return this.countService.generateCountTemplate(categoryIds, includeInactiveFlag);
  }

  /**
   * Get a specific inventory count by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.countService.findOne(id);
  }

  /**
   * Update the status of an inventory count
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InventoryCountStatus,
    @Request() req: RequestWithUser
  ) {
    if (!status || !Object.values(InventoryCountStatus).includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return this.countService.updateStatus(id, status, req.user);
  }

  /**
   * Reconcile inventory based on count results
   * This will create adjustment transactions to match actual quantities
   */
  @Post(':id/reconcile')
  async reconcileInventory(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.countService.reconcileInventory(id, req.user);
    return { success: true, message: 'Inventory successfully reconciled' };
  }
}
