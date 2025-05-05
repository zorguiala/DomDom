import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum NotificationType {
  PRODUCTION_COMPLETED = 'production_completed',
  PRODUCTION_STARTED = 'production_started',
  QUALITY_ISSUE = 'quality_issue',
  BATCH_COMPLETED = 'batch_completed',
  PRODUCTION_DELAYED = 'production_delayed',
  WASTAGE_ALERT = 'wastage_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Type of notification', enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;
  
  @ApiProperty({ description: 'Title of the notification', example: 'Production Order Completed' })
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @ApiProperty({ description: 'Message content', example: 'Production order #123 for Bread has been completed' })
  @IsString()
  @IsNotEmpty()
  message: string;
  
  @ApiProperty({ description: 'Related entity ID (e.g., production order ID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;
  
  @ApiProperty({ description: 'User ID to notify', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
  
  @ApiProperty({ description: 'Priority level', enum: NotificationPriority, required: false })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority = NotificationPriority.MEDIUM;
  
  @ApiProperty({ description: 'Should this notification be marked as read', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean = false;
}

export class NotificationResponse {
  @ApiProperty({ description: 'Notification ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;
  
  @ApiProperty({ description: 'Type of notification', enum: NotificationType })
  type: NotificationType;
  
  @ApiProperty({ description: 'Title of the notification', example: 'Production Order Completed' })
  title: string;
  
  @ApiProperty({ description: 'Message content', example: 'Production order #123 for Bread has been completed' })
  message: string;
  
  @ApiProperty({ description: 'Related entity ID (e.g., production order ID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  entityId: string;
  
  @ApiProperty({ description: 'User ID that was notified', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;
  
  @ApiProperty({ description: 'Priority level', enum: NotificationPriority })
  priority: NotificationPriority;
  
  @ApiProperty({ description: 'Whether notification has been read', example: false })
  isRead: boolean;
  
  @ApiProperty({ description: 'Creation timestamp', example: '2023-05-01T12:34:56Z' })
  createdAt: string;
}

export class GetNotificationsFilterDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;
  
  @ApiProperty({ description: 'Show only unread notifications', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
  
  @ApiProperty({ description: 'Filter by notification type', enum: NotificationType, required: false })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
  
  @ApiProperty({ description: 'Filter by notification priority', enum: NotificationPriority, required: false })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
} 