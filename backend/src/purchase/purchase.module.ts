import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';
import { PurchaseReceiptService } from './services/purchase-receipt.service';

@Module({
  imports: [
    PrismaModule,
    StockModule,
  ],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    PurchaseReceiptService,
  ],
  exports: [PurchaseService],
})
export class PurchaseModule {}
