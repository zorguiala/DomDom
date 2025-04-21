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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminders.dto';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    return await this.remindersService.findAll(type);
  }

  @Get('due')
  async findDue() {
    return await this.remindersService.findDue();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.remindersService.findOne(+id);
  }

  @Post()
  async create(@Body() createReminderDto: CreateReminderDto) {
    return await this.remindersService.create(createReminderDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return await this.remindersService.update(+id, updateReminderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.remindersService.remove(+id);
  }
}
