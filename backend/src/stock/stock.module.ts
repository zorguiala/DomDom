import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockBatchController } from './stock-batch.controller';
import { StockCountController } from './stock-count.controller';
import { StockTransactionController } from './stock-transaction.controller';
import { StockWastageController } from './stock-wastage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    StockController,
    StockBatchController,
    StockCountController,
    StockTransactionController,
    StockWastageController,
  ],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
