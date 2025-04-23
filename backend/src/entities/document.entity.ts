import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DocumentType, DocumentFormat } from './enums/document.enum';

@Entity('documents')
export class Document extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.CUSTOM,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentFormat,
    default: DocumentFormat.PDF,
  })
  format: DocumentFormat;

  @Column()
  filePath: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ nullable: true })
  relatedEntityType: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;
}
