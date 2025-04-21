import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BOMItem } from './bom-item.entity';

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

  @OneToMany(() => BOMItem, (bomItem) => bomItem.bom, { cascade: true })
  items: BOMItem[];
}
