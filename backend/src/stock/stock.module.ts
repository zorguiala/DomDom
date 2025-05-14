import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { StockTransaction } from '../entities/stock-transaction.entity';
import { StockCount, StockCountItem } from '../entities/stock-count.entity';
import { StockController } from './stock.controller';
import { StockTransactionController } from './stock-transaction.controller';
import { StockCountController } from './stock-count.controller';
import { StockService } from './services/stock.service';
import { StockTransactionService } from './services/stock-transaction.service';
import { StockCountService } from './services/stock-count.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockTransaction, StockCount, StockCountItem])],
  controllers: [StockController, StockTransactionController, StockCountController],
  providers: [StockService, StockTransactionService, StockCountService],
  exports: [StockService, StockTransactionService, StockCountService],
})
export class StockModule {}
