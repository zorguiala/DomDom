import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { StockTransaction } from '../entities/stock-transaction.entity';
import { StockCount, StockCountItem } from '../entities/stock-count.entity';
import { StockBatch } from '../entities/stock-batch.entity';
import { StockWastage } from '../entities/stock-wastage.entity';
import { StockController } from './stock.controller';
import { StockTransactionController } from './stock-transaction.controller';
import { StockCountController } from './stock-count.controller';
import { StockBatchController } from './stock-batch.controller';
import { StockWastageController } from './stock-wastage.controller';
import { StockService } from './services/stock.service';
import { StockTransactionService } from './services/stock-transaction.service';
import { StockCountService } from './services/stock-count.service';
import { StockBatchService } from './services/stock-batch.service';
import { StockWastageService } from './services/stock-wastage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, 
      StockTransaction, 
      StockCount, 
      StockCountItem,
      StockBatch,
      StockWastage
    ])
  ],
  controllers: [
    StockController, 
    StockTransactionController, 
    StockCountController,
    StockBatchController,
    StockWastageController
  ],
  providers: [
    StockService, 
    StockTransactionService, 
    StockCountService,
    StockBatchService,
    StockWastageService
  ],
  exports: [
    StockService, 
    StockTransactionService, 
    StockCountService,
    StockBatchService,
    StockWastageService
  ],
})
export class StockModule {}
