import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOM } from '../entities/bom.entity';
import { BOMItem } from '../entities/bom-item.entity';
import { Product } from '../entities/product.entity';
import { BOMService } from './bom.service';
import { BOMController } from './bom.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [TypeOrmModule.forFeature([BOM, BOMItem, Product]), InventoryModule],
  providers: [BOMService],
  controllers: [BOMController],
  exports: [BOMService],
})
export class BOMModule {}
