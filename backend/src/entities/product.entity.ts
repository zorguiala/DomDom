import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOMItem } from './bom-item.entity';
// Import removed during refactoring: import { InventoryTransaction } from './inventory-transaction.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumStock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'int' })
  leadTimeDays: number;

  @Column({ default: false })
  isRawMaterial: boolean;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  lastPurchasePrice: number;

  // Profitability metrics
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  profitMargin: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  averageSalesPerDay: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSalesQuantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSalesValue: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  stockValue: number;

  @Column({ nullable: true, type: 'timestamp' })
  lastSoldAt: Date;

  @OneToMany(() => BOMItem, (bomItem) => bomItem.product)
  bomItems: BOMItem[];

  /* Temporarily disabled during refactoring to StockItem
  @OneToMany(() => InventoryTransaction, (transaction) => transaction.product)
  inventoryTransactions: InventoryTransaction[];
  */

  // Reference to the corresponding StockItem - temporarily commented out during refactoring
  @Column({ nullable: true })
  stockItemId: string;
  
  /* Temporarily disabled during refactoring to StockItem to avoid circular references
  @ManyToOne('StockItem', { nullable: true })
  @JoinColumn({ name: 'stockItemId' })
  stockItem: any;
  */
  
  // Category for the product
  @Column({ nullable: true })
  categoryId: string;
}
