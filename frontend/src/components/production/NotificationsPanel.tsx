/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  List,
  Badge,
  Card,
  Typography,
  Tag,
  Button,
  Avatar,
  Select,
  Spin,
  Empty,
  message,
  Drawer,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import ProductionService from "../../services/production.service";
import {
  Notification,
  NotificationPriority,
  NotificationType,
  NotificationsFilterDto,
} from "../../types/production";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

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
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<NotificationsFilterDto>({
    userId,
    unreadOnly: true,
  });
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

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
      console.error("Error fetching notifications:", error);
      message.error(t("notifications.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notification: Notification) => {
    try {
      await ProductionService.markNotificationAsRead(notification.id);
      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      message.success(t("notifications.markedAsRead"));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error(t("notifications.markReadError"));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await ProductionService.markAllNotificationsAsRead(userId);
      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, isRead: true }))
      );
      message.success(t("notifications.allMarkedAsRead"));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      message.error(t("notifications.markAllReadError"));
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
        return <CheckOutlined style={{ color: "#52c41a" }} />;
      case NotificationType.BATCH_COMPLETED:
        return <CheckOutlined style={{ color: "#1890ff" }} />;
      case NotificationType.QUALITY_ISSUE:
        return <WarningOutlined style={{ color: "#faad14" }} />;
      case NotificationType.PRODUCTION_DELAYED:
        return <ClockCircleOutlined style={{ color: "#ff4d4f" }} />;
      case NotificationType.WASTAGE_ALERT:
        return <WarningOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getNotificationColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return "#ff4d4f";
      case NotificationPriority.MEDIUM:
        return "#faad14";
      case NotificationPriority.LOW:
        return "#52c41a";
      default:
        return "#1890ff";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const PriorityTag = ({ priority }: { priority: NotificationPriority }) => {
    const { t } = useTranslation();

    const getColor = (priority: NotificationPriority): string => {
      switch (priority) {
        case NotificationPriority.HIGH:
          return "error";
        case NotificationPriority.MEDIUM:
          return "warning";
        case NotificationPriority.LOW:
          return "default";
        default:
          return "default";
      }
    };

    return (
      <Tag color={getColor(priority)}>
        {t(`notifications.priority.${priority.toLowerCase()}`)}
      </Tag>
    );
  };

  // Add PropTypes validation
  PriorityTag.propTypes = {
    priority: PropTypes.oneOf(Object.values(NotificationPriority)).isRequired,
  };

  return (
    <div className="notifications-panel">
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <BellOutlined style={{ marginRight: 8 }} />
              <span>{t("notifications.title")}</span>
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ marginLeft: 8 }} />
              )}
            </div>
            {unreadCount > 0 && (
              <Button type="link" onClick={markAllAsRead} size="small">
                {t("notifications.markAllAsRead")}
              </Button>
            )}
          </div>
        }
        extra={
          <Button type="primary" onClick={fetchNotifications} size="small">
            {t("common.refresh")}
          </Button>
        }
      >
        {showFilters && (
          <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            <Select
              style={{ width: 150 }}
              placeholder={t("notifications.filterByType")}
              allowClear
              onChange={(value) => setFilters({ ...filters, type: value })}
              value={filters.type}
            >
              {Object.values(NotificationType).map((type) => (
                <Option key={type} value={type}>
                  {t(`notifications.type.${type.toLowerCase()}`)}
                </Option>
              ))}
            </Select>

            <Select
              style={{ width: 150 }}
              placeholder={t("notifications.filterByPriority")}
              allowClear
              onChange={(value) => setFilters({ ...filters, priority: value })}
              value={filters.priority}
            >
              {Object.values(NotificationPriority).map((priority) => (
                <Option key={priority} value={priority}>
                  {t(`notifications.priority.${priority.toLowerCase()}`)}
                </Option>
              ))}
            </Select>

            <Select
              style={{ width: 150 }}
              placeholder={t("notifications.readStatus")}
              allowClear
              onChange={(value) =>
                setFilters({ ...filters, unreadOnly: value })
              }
              value={filters.unreadOnly}
            >
              <Option value={true}>{t("notifications.unreadOnly")}</Option>
              <Option value={false}>
                {t("notifications.allNotifications")}
              </Option>
            </Select>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty description={t("notifications.noNotifications")} />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={
              collapsed ? notifications.slice(0, maxItems) : notifications
            }
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                actions={[
                  <Button
                    key="action-button"
                    type="link"
                    onClick={() => markAsRead(notification)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead
                      ? t("notifications.read")
                      : t("notifications.markAsRead")}
                  </Button>,
                ]}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "rgba(24, 144, 255, 0.05)",
                  cursor: "pointer",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      style={{
                        backgroundColor: getNotificationColor(
                          notification.priority
                        ),
                      }}
                    />
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: 8 }}>
                        {notification.title}
                      </span>
                      <PriorityTag priority={notification.priority} />
                      {!notification.isRead && (
                        <Badge status="processing" style={{ marginLeft: 8 }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{notification.message}</div>
                      <small style={{ color: "rgba(0, 0, 0, 0.45)" }}>
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
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="link" onClick={() => setDrawerVisible(true)}>
              {t("notifications.viewAll", { count: notifications.length })}
            </Button>
          </div>
        )}
      </Card>

      <Drawer
        title={t("notifications.details")}
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedNotification(null);
        }}
        open={drawerVisible}
        width={500}
      >
        {selectedNotification ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{selectedNotification.title}</Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <PriorityTag priority={selectedNotification.priority} />
                <span style={{ marginLeft: 8, color: "rgba(0, 0, 0, 0.45)" }}>
                  {dayjs(selectedNotification.createdAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text>{selectedNotification.message}</Text>
              </div>

              <Card size="small" title={t("notifications.relatedInfo")}>
                <p>
                  <strong>{t("notifications.type.label")}:</strong>{" "}
                  {t(
                    `notifications.type.${selectedNotification.type.toLowerCase()}`
                  )}
                </p>
                <p>
                  <strong>{t("notifications.entityId")}:</strong>{" "}
                  {selectedNotification.entityId}
                </p>
                <p>
                  <strong>{t("notifications.status")}:</strong>{" "}
                  {selectedNotification.isRead
                    ? t("notifications.statusRead")
                    : t("notifications.statusUnread")}
                </p>
              </Card>

              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  onClick={() => {
                    /* Navigate to related entity */
                  }}
                >
                  {t("notifications.viewRelatedItem")}
                </Button>

                {!selectedNotification.isRead && (
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={() => markAsRead(selectedNotification)}
                  >
                    {t("notifications.markAsRead")}
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
                key={notification.id}
                actions={[
                  <Button
                    key="action-button"
                    type="link"
                    onClick={() => markAsRead(notification)}
                    disabled={notification.isRead}
                  >
                    {notification.isRead
                      ? t("notifications.read")
                      : t("notifications.markAsRead")}
                  </Button>,
                ]}
                onClick={() => setSelectedNotification(notification)}
                style={{
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "rgba(24, 144, 255, 0.05)",
                  cursor: "pointer",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      style={{
                        backgroundColor: getNotificationColor(
                          notification.priority
                        ),
                      }}
                    />
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: 8 }}>
                        {notification.title}
                      </span>
                      <PriorityTag priority={notification.priority} />
                      {!notification.isRead && (
                        <Badge status="processing" style={{ marginLeft: 8 }} />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>{notification.message}</div>
                      <small style={{ color: "rgba(0, 0, 0, 0.45)" }}>
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
