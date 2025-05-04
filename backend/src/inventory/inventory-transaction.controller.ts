import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';

@Controller('inventory-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryTransactionController {
  constructor(private readonly inventoryTransactionService: InventoryTransactionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(
    @Body() createInventoryTransactionDto: CreateInventoryTransactionDto
  ): Promise<InventoryTransaction> {
    return this.inventoryTransactionService.create(createInventoryTransactionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('productId') productId?: string
  ): Promise<InventoryTransaction[]> {
    return this.inventoryTransactionService.findAll(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      type,
      productId
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findOne(@Param('id') id: string): Promise<InventoryTransaction> {
    return this.inventoryTransactionService.findOne(id);
  }
}
