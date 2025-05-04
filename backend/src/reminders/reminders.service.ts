import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from '../entities/reminder.entity';
import {
  CreateReminderDto,
  UpdateReminderDto,
  ReminderResponseDto,
  ReminderStatus,
} from './dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>
  ) {}

  async create(createReminderDto: CreateReminderDto): Promise<ReminderResponseDto> {
    const reminder = this.remindersRepository.create({
      ...createReminderDto,
      status: ReminderStatus.PENDING,
    });

    const savedReminder = await this.remindersRepository.save(reminder);
    return this.mapToResponseDto(savedReminder);
  }

  async findAll(): Promise<ReminderResponseDto[]> {
    const reminders = await this.remindersRepository.find({
      order: { dueDate: 'ASC' },
    });
    return reminders.map((reminder) => this.mapToResponseDto(reminder));
  }

  async findAllPending(): Promise<ReminderResponseDto[]> {
    const reminders = await this.remindersRepository.find({
      where: { status: ReminderStatus.PENDING },
      order: { dueDate: 'ASC' },
    });
    return reminders.map((reminder) => this.mapToResponseDto(reminder));
  }

  async findOne(id: number): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findOne({ where: { id } });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return this.mapToResponseDto(reminder);
  }

  async update(id: number, updateReminderDto: UpdateReminderDto): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findOne({ where: { id } });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    Object.assign(reminder, updateReminderDto);
    const updatedReminder = await this.remindersRepository.save(reminder);

    return this.mapToResponseDto(updatedReminder);
  }

  async remove(id: number): Promise<void> {
    const result = await this.remindersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }
  }

  async markAsCompleted(id: number): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findOne({ where: { id } });

    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    reminder.status = ReminderStatus.COMPLETED;
    const updatedReminder = await this.remindersRepository.save(reminder);

    return this.mapToResponseDto(updatedReminder);
  }

  async getDueReminders(): Promise<ReminderResponseDto[]> {
    const today = new Date();

    const reminders = await this.remindersRepository
      .createQueryBuilder('reminder')
      .where('reminder.dueDate <= :today', { today })
      .andWhere('reminder.status = :status', { status: ReminderStatus.PENDING })
      .orderBy('reminder.dueDate', 'ASC')
      .getMany();

    return reminders.map((reminder) => this.mapToResponseDto(reminder));
  }

  private mapToResponseDto(reminder: Reminder): ReminderResponseDto {
    return {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      type: reminder.type,
      status: reminder.status,
      amount: reminder.amount,
      relatedEntityId: reminder.relatedEntityId,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }
}
