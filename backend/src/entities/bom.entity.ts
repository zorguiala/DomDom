import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOMItem } from './bom-item.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('boms')
export class BOM extends BaseEntity {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  outputQuantity: number;

  @Column()
  outputUnit: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Product, { nullable: true })
  outputProduct: Product;

  @OneToMany(() => BOMItem, (bomItem) => bomItem.bom, { cascade: true })
  items: BOMItem[];

  @ManyToOne(() => User)
  createdBy: User;
}
