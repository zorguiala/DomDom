import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DocumentType, DocumentFormat } from '../documents/dto/document-template.dto';

@Entity('documents')
export class Document extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ type: 'enum', enum: DocumentFormat })
  format: DocumentFormat;

  @Column()
  filePath: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @ManyToOne(() => User)
  createdBy: User;
}
