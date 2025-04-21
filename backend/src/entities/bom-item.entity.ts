import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOM } from './bom.entity';
import { Product } from './product.entity';

@Entity('bom_items')
export class BOMItem extends BaseEntity {
  @ManyToOne(() => BOM, (bom) => bom.items, { onDelete: 'CASCADE' })
  bom: BOM;

  @ManyToOne(() => Product, (product) => product.bomItems)
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  wastagePercent: number;
}
