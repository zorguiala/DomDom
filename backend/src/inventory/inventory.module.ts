import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { Product } from '../entities/product.entity';
import { InventoryController } from './inventory.controller';
import { InventoryTransactionService } from './services/inventory-transaction.service';
import { InventoryStockService } from './services/inventory-stock.service';
import { InventoryAnalyticsService } from './services/inventory-analytics.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryTransaction, Product]), ProductsModule],
  providers: [InventoryTransactionService, InventoryStockService, InventoryAnalyticsService],
  controllers: [InventoryController],
  exports: [InventoryTransactionService, InventoryStockService, InventoryAnalyticsService],
})
export class InventoryModule {}
