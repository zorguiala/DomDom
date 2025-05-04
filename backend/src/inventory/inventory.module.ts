import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { Product } from '../entities/product.entity';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { InventoryWastage } from '../entities/inventory-wastage.entity';
import { InventoryCount, InventoryCountItem } from '../entities/inventory-count.entity';
import { InventoryController } from './inventory.controller';
import { InventoryBatchController } from './inventory-batch.controller';
import { InventoryWastageController } from './inventory-wastage.controller';
import { InventoryCountController } from './inventory-count.controller';
import { InventoryForecastController } from './inventory-forecast.controller';
import { InventoryTransactionService } from './services/inventory-transaction.service';
import { InventoryStockService } from './services/inventory-stock.service';
import { InventoryAnalyticsService } from './services/inventory-analytics.service';
import { InventoryBatchService } from './services/inventory-batch.service';
import { InventoryWastageService } from './services/inventory-wastage.service';
import { InventoryCountService } from './services/inventory-count.service';
import { InventoryForecastService } from './services/inventory-forecast.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryTransaction,
      Product,
      InventoryBatch,
      InventoryWastage,
      InventoryCount,
      InventoryCountItem,
    ]),
    ProductsModule,
  ],
  providers: [
    InventoryTransactionService,
    InventoryStockService,
    InventoryAnalyticsService,
    InventoryBatchService,
    InventoryWastageService,
    InventoryCountService,
    InventoryForecastService,
  ],
  controllers: [
    InventoryController,
    InventoryBatchController,
    InventoryWastageController,
    InventoryCountController,
    InventoryForecastController,
  ],
  exports: [
    InventoryTransactionService,
    InventoryStockService,
    InventoryAnalyticsService,
    InventoryBatchService,
    InventoryWastageService,
    InventoryCountService,
    InventoryForecastService,
  ],
})
export class InventoryModule {}
