import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductionOrder } from './production-order.entity';
import { Product } from './product.entity';

@Entity('production_order_items')
export class ProductionOrderItem extends BaseEntity {
  @ManyToOne(() => ProductionOrder, (order) => order.items)
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: ProductionOrder;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
