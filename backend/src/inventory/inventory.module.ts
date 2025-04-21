import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { InventoryTransaction } from '../entities/inventory-transaction.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, InventoryTransaction])],
  providers: [InventoryService, ProductService],
  controllers: [InventoryController, ProductController],
  exports: [InventoryService, ProductService],
})
export class InventoryModule {}
