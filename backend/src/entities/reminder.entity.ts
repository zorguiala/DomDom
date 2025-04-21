import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ReminderType, ReminderStatus } from '../reminders/dto/reminder.dto';
import { BaseEntity } from './base.entity';

@Entity('reminders')
export class Reminder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ReminderType,
    default: ReminderType.OTHER,
  })
  type: ReminderType;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  relatedEntityId: string;
}
