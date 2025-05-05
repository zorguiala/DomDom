import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './services/notification.service';
import {
  CreateNotificationDto,
  GetNotificationsFilterDto,
  NotificationResponse,
} from './dto/notification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications with optional filtering' })
  @ApiResponse({ status: 200, description: 'Returns notifications', type: [NotificationResponse] })
  @Get()
  async getNotifications(
    @Query() filterDto: GetNotificationsFilterDto,
  ): Promise<NotificationResponse[]> {
    return this.notificationService.getNotifications(filterDto);
  }

  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created', type: NotificationResponse })
  @Post()
  async createNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponse> {
    return this.notificationService.createNotification(createDto);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponse })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<NotificationResponse> {
    return this.notificationService.markAsRead(id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @Patch('mark-all-read/:userId')
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationService.markAllAsRead(userId);
  }
} 