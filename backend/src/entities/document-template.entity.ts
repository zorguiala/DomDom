import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DocumentType } from '../documents/dto/document-template.dto';

@Entity('document_templates')
export class DocumentTemplate extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column('text')
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column('text', { nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  requiredFields: string[];

  @ManyToOne(() => User)
  createdBy: User;

  @Column({ default: true })
  isActive: boolean;
}
