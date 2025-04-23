import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto, ReminderResponseDto } from './dto/reminder.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Reminders')
@ApiBearerAuth()
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @ApiOperation({ summary: 'Get all reminders' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter reminders by type' })
  @ApiResponse({ status: 200, description: 'List of reminders', type: [ReminderResponseDto] })
  @Get()
  async findAll(@Query('type') type?: string): Promise<ReminderResponseDto[]> {
    return await this.remindersService.findAll();
  }

  @ApiOperation({ summary: 'Get all pending reminders' })
  @ApiResponse({ status: 200, description: 'List of pending reminders', type: [ReminderResponseDto] })
  @Get('pending')
  async findAllPending(): Promise<ReminderResponseDto[]> {
    return await this.remindersService.findAllPending();
  }

  @ApiOperation({ summary: 'Get all due reminders' })
  @ApiResponse({ status: 200, description: 'List of due reminders', type: [ReminderResponseDto] })
  @Get('due')
  async getDueReminders(): Promise<ReminderResponseDto[]> {
    return await this.remindersService.getDueReminders();
  }

  @ApiOperation({ summary: 'Get a reminder by ID' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'The reminder', type: ReminderResponseDto })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReminderResponseDto> {
    return await this.remindersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiResponse({ status: 201, description: 'The reminder has been created', type: ReminderResponseDto })
  @Post()
  async create(@Body() createReminderDto: CreateReminderDto): Promise<ReminderResponseDto> {
    return await this.remindersService.create(createReminderDto);
  }

  @ApiOperation({ summary: 'Update a reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'The reminder has been updated', type: ReminderResponseDto })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReminderDto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    return await this.remindersService.update(id, updateReminderDto);
  }

  @ApiOperation({ summary: 'Mark a reminder as completed' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'The reminder has been marked as completed', type: ReminderResponseDto })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Put(':id/complete')
  async markAsCompleted(@Param('id', ParseIntPipe) id: number): Promise<ReminderResponseDto> {
    return await this.remindersService.markAsCompleted(id);
  }

  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiResponse({ status: 200, description: 'The reminder has been deleted' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.remindersService.remove(id);
  }
}
