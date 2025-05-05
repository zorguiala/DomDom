import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { 
  CreateNotificationDto, 
  GetNotificationsFilterDto, 
  NotificationResponse,
  NotificationType,
  NotificationPriority 
} from '../dto/notification.dto';
import { User } from '../../entities/user.entity';
import { ProductionOrder } from '../../entities/production-order.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
  ) {}

  /**
   * Create a new notification
   */
  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponse> {
    const notification = new Notification();
    notification.type = createDto.type;
    notification.title = createDto.title;
    notification.message = createDto.message;
    notification.entityId = createDto.entityId;
    notification.priority = createDto.priority || NotificationPriority.MEDIUM;
    notification.isRead = createDto.isRead || false;
    
    if (createDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: createDto.userId } });
      if (user) {
        notification.user = user;
      }
    }
    
    const savedNotification = await this.notificationRepository.save(notification);
    
    return this.mapToResponse(savedNotification);
  }
  
  /**
   * Create a notification for a completed production order
   */
  async notifyProductionOrderCompleted(productionOrderId: string): Promise<NotificationResponse> {
    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id: productionOrderId },
      relations: ['bom', 'assignedTo', 'createdBy'],
    });
    
    if (!productionOrder) {
      throw new Error(`Production order with ID ${productionOrderId} not found`);
    }
    
    const notificationDto: CreateNotificationDto = {
      type: NotificationType.PRODUCTION_COMPLETED,
      title: 'Production Order Completed',
      message: `Production order for ${productionOrder.bom.name} (Quantity: ${productionOrder.quantity}) has been completed.`,
      entityId: productionOrderId,
      userId: productionOrder.assignedTo?.id || productionOrder.createdBy?.id,
      priority: NotificationPriority.MEDIUM,
    };
    
    return this.createNotification(notificationDto);
  }
  
  /**
   * Create a notification for a batch completion
   */
  async notifyBatchCompleted(productionOrderId: string, batchNumber: string): Promise<NotificationResponse> {
    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id: productionOrderId },
      relations: ['bom', 'assignedTo', 'createdBy'],
    });
    
    if (!productionOrder) {
      throw new Error(`Production order with ID ${productionOrderId} not found`);
    }
    
    const notificationDto: CreateNotificationDto = {
      type: NotificationType.BATCH_COMPLETED,
      title: 'Batch Production Completed',
      message: `Batch ${batchNumber} for ${productionOrder.bom.name} has been completed.`,
      entityId: productionOrderId,
      userId: productionOrder.assignedTo?.id || productionOrder.createdBy?.id,
      priority: NotificationPriority.MEDIUM,
    };
    
    return this.createNotification(notificationDto);
  }
  
  /**
   * Create a notification for a quality issue in production
   */
  async notifyQualityIssue(productionOrderId: string, issue: string): Promise<NotificationResponse> {
    const productionOrder = await this.productionOrderRepository.findOne({
      where: { id: productionOrderId },
      relations: ['bom', 'assignedTo', 'createdBy'],
    });
    
    if (!productionOrder) {
      throw new Error(`Production order with ID ${productionOrderId} not found`);
    }
    
    const notificationDto: CreateNotificationDto = {
      type: NotificationType.QUALITY_ISSUE,
      title: 'Quality Issue Detected',
      message: `Quality issue for ${productionOrder.bom.name}: ${issue}`,
      entityId: productionOrderId,
      userId: productionOrder.assignedTo?.id || productionOrder.createdBy?.id,
      priority: NotificationPriority.HIGH,
    };
    
    return this.createNotification(notificationDto);
  }
  
  /**
   * Get notifications with filtering options
   */
  async getNotifications(filterDto: GetNotificationsFilterDto): Promise<NotificationResponse[]> {
    const { userId, unreadOnly, type, priority } = filterDto;
    
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.createdAt', 'DESC');
    
    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }
    
    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }
    
    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }
    
    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }
    
    const notifications = await queryBuilder.getMany();
    
    return notifications.map(notification => this.mapToResponse(notification));
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    
    notification.isRead = true;
    const updatedNotification = await this.notificationRepository.save(notification);
    
    return this.mapToResponse(updatedNotification);
  }
  
  /**
   * Mark all notifications as read for a specific user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user.id = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }
  
  /**
   * Map notification entity to DTO response
   */
  private mapToResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityId: notification.entityId,
      userId: notification.user?.id,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };
  }
} 