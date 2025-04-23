import { Entity, Column } from 'typeorm';
import { ReminderType, ReminderStatus } from '../reminders/dto/reminder.dto';
import { BaseNumericEntity } from './base-numeric.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reminders')
export class Reminder extends BaseNumericEntity {
  @ApiProperty({ description: 'The title of the reminder' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Optional description of the reminder', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'The due date of the reminder' })
  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ApiProperty({
    description: 'The type of reminder',
    enum: ReminderType,
    default: ReminderType.OTHER,
  })
  @Column({
    type: 'enum',
    enum: ReminderType,
    default: ReminderType.OTHER,
  })
  type: ReminderType;

  @ApiProperty({
    description: 'The status of the reminder',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @ApiProperty({
    description: 'Optional amount associated with the reminder',
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @ApiProperty({
    description: 'Optional ID of a related entity',
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  relatedEntityId: number;
}
