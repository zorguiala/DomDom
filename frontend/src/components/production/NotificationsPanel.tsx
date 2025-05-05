import React, { useState, useEffect } from 'react';
import { List, Badge, Card, Typography, Tag, Button, Avatar, Select, Spin, Empty, message, Drawer } from 'antd';
import { BellOutlined, CheckOutlined, InfoCircleOutlined, WarningOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ProductionService from '../../services/production.service';
import { Notification, NotificationPriority, NotificationType, NotificationsFilterDto } from '../../types/production';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

interface NotificationsPanelProps {
  userId?: string;
  maxItems?: number;
  showFilters?: boolean;
  collapsed?: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  userId, 
  maxItems = 5,
  showFilters = true,
  collapsed = false,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<NotificationsFilterDto>({
    userId,
    unreadOnly: true,
  });
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [filters, userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const updatedFilters = { ...filters, userId: userId || filters.userId };
      const data = await ProductionService.getNotifications(updatedFilters);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notification: Notification) => {
    try {
      await ProductionService.markNotificationAsRead(notification.id);
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id 
            ? { ...n, isRead: true } 
            : n
        )
      );
      message.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await ProductionService.markAllNotificationsAsRead(userId);
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      message.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDrawerVisible(true);
    
    // If not read, mark as read
    if (!notification.isRead) {
      markAsRead(notification);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PRODUCTION_COMPLETED:
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case NotificationType.BATCH_COMPLETED:
        return <CheckOutlined style={{ color: '#1890ff' }} />;
      case NotificationType.QUALITY_ISSUE:
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case NotificationType.PRODUCTION_DELAYED:
        return <ClockCircleOutlined style={{ color: '#ff4d4f' }} />;
      case NotificationType.WASTAGE_ALERT:
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getNotificationColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return '#ff4d4f';
      case NotificationPriority.MEDIUM:
        return '#faad14';
      case NotificationPriority.LOW:
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const PriorityTag = ({ priority }: { priority: NotificationPriority }) => {
    let color = '';
    let text = '';
    
    switch (priority) {
      case NotificationPriority.HIGH:
        color = 'red';
        text = 'High';
        break;
      case NotificationPriority.MEDIUM:
        color = 'orange';
        text = 'Medium';
        break;
      case NotificationPriority.LOW:
        color = 'green';
        text = 'Low';
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <div className="notifications-panel">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <BellOutlined style={{ marginRight: 8 }} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ marginLeft: 8 }} />
              )}
            </div>
            {unreadCount > 0 && (
              <Button type="link" onClick={markAllAsRead} size="small">
                Mark all as read
              </Button>
            )}
          </div>
        }
        extra={
          <Button type="primary" onClick={fetchNotifications} size="small">
            Refresh
          </Button>
        }
      >
        {showFilters && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Select
              style={{ width: 150 }}
              placeholder="Filter by type"
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value })}
              value={filters.type}
            >
              {Object.values(NotificationType).map(type => (
                <Option key={type} value={type}>
                  {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </Option>
              ))}
            </Select>
            
            <Select
              style={{ width: 150 }}
              placeholder="Filter by priority"
              allowClear
              onChange={(value) => setFilters({ ...filters, priority: value })}
              value={filters.priority}
            >
              {Object.values(NotificationPriority).map(priority => (
                <Option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                </Option>
              ))}
            </Select>
            
            <Select
              style={{ width: 150 }}
              placeholder="Read status"
              allowClear
              onChange={(value) => setFilters({ ...filters, unreadOnly: value })}
              value={filters.unreadOnly}
            >
              <Option value={true}>Unread only</Option>
              <Option value={false}>All notifications</Option>
            </Select>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty description="No notifications found" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={collapsed ? notifications.slice(0, maxItems) : notifications}
            renderItem={(notification) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => markAsRead(notification)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead ? 'Read' : 'Mark as read'}
                  </Button>
                ]}
                onClick={() => handleNotificationClick(notification)}
                style={{ 
                  backgroundColor: notification.isRead ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                  cursor: 'pointer',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(notification.type)} 
                      style={{ backgroundColor: getNotificationColor(notification.priority) }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>{notification.title}</span>
                      <PriorityTag priority={notification.priority} />
                      {!notification.isRead && (
                        <Badge status="processing" style={{ marginLeft: 8 }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{notification.message}</div>
                      <small style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                        {dayjs(notification.createdAt).fromNow()}
                      </small>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
        
        {collapsed && notifications.length > maxItems && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="link" onClick={() => setDrawerVisible(true)}>
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </Card>

      <Drawer
        title="Notification Details"
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedNotification(null);
        }}
        visible={drawerVisible}
        width={500}
      >
        {selectedNotification ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{selectedNotification.title}</Title>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <PriorityTag priority={selectedNotification.priority} />
                <span style={{ marginLeft: 8, color: 'rgba(0, 0, 0, 0.45)' }}>
                  {dayjs(selectedNotification.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text>{selectedNotification.message}</Text>
              </div>
              
              <Card size="small" title="Related Information">
                <p><strong>Type:</strong> {selectedNotification.type.replace('_', ' ').toLowerCase()}</p>
                <p><strong>Entity ID:</strong> {selectedNotification.entityId}</p>
                <p><strong>Status:</strong> {selectedNotification.isRead ? 'Read' : 'Unread'}</p>
              </Card>
              
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  onClick={() => { /* Navigate to related entity */ }}
                >
                  View Related Item
                </Button>
                
                {!selectedNotification.isRead && (
                  <Button 
                    style={{ marginLeft: 8 }} 
                    onClick={() => markAsRead(selectedNotification)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => markAsRead(notification)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead ? 'Read' : 'Mark as read'}
                  </Button>
                ]}
                onClick={() => setSelectedNotification(notification)}
                style={{ 
                  backgroundColor: notification.isRead ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                  cursor: 'pointer',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(notification.type)} 
                      style={{ backgroundColor: getNotificationColor(notification.priority) }} 
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>{notification.title}</span>
                      <PriorityTag priority={notification.priority} />
                      {!notification.isRead && (
                        <Badge status="processing" style={{ marginLeft: 8 }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{notification.message}</div>
                      <small style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                        {dayjs(notification.createdAt).fromNow()}
                      </small>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default NotificationsPanel; 