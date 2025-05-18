import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StockItemType } from '../stock/types/stock.types';

/**
 * StockItem entity - simplified version without circular references
 * This represents any item in stock (raw materials, finished goods, packaging)
 */
@Entity()
export class StockItem extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sellingPrice: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({
    type: 'enum',
    enum: StockItemType,
    default: StockItemType.RAW
  })
  type: StockItemType;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  lastPurchasePrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  averageCostPrice: number;

  @Column({ nullable: true })
  supplierId: string;

  @Column({ nullable: true })
  bomId: string;

  // Calculate total value of this stock item
  get stockValue(): number {
    return this.currentQuantity * this.costPrice;
  }

  // Calculate profit margin if selling price is available
  get profitMargin(): number | null {
    if (!this.sellingPrice) return null;
    return ((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100;
  }
}
