import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DocumentType } from './enums/document.enum';

@Entity('document_templates')
export class DocumentTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.CUSTOM,
  })
  type: DocumentType;

  @Column('text')
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  requiredFields: string[];

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  createdBy: User;
}
