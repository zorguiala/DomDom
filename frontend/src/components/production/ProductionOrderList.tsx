import { Table, Tag, Button, Space, Dropdown, Menu } from "antd";
import {
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { ProductionOrder, ProductionOrderStatus } from "../../types/production";

interface ProductionOrderListProps {
  orders: ProductionOrder[];
  onView: (order: ProductionOrder) => void;
  onEdit: (order: ProductionOrder) => void;
  onDelete: (order: ProductionOrder) => void;
  onUpdateStatus: (
    order: ProductionOrder,
    status: ProductionOrderStatus
  ) => void;
  onRecordProduction: (order: ProductionOrder) => void;
}

export function ProductionOrderList({
  orders,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  onRecordProduction,
}: ProductionOrderListProps) {
  const { t } = useTranslation();

  const getStatusTagColor = (status: ProductionOrderStatus) => {
    switch (status) {
      case ProductionOrderStatus.PLANNED:
        return "blue";
      case ProductionOrderStatus.IN_PROGRESS:
        return "processing";
      case ProductionOrderStatus.COMPLETED:
        return "success";
      case ProductionOrderStatus.CANCELLED:
        return "error";
      case ProductionOrderStatus.ON_HOLD:
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: ProductionOrderStatus) => {
    switch (status) {
      case ProductionOrderStatus.PLANNED:
        return t("production.status.planned");
      case ProductionOrderStatus.IN_PROGRESS:
        return t("production.status.inProgress");
      case ProductionOrderStatus.COMPLETED:
        return t("production.status.completed");
      case ProductionOrderStatus.CANCELLED:
        return t("production.status.cancelled");
      case ProductionOrderStatus.ON_HOLD:
        return t("production.status.onHold");
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return t("production.priority.high");
      case "medium":
        return t("production.priority.medium");
      case "low":
        return t("production.priority.low");
      default:
        return priority;
    }
  };

  const getPriorityTagColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusMenuItems = (order: ProductionOrder) => {
    const items = [];

    // Only show relevant status changes based on current status
    switch (order.status) {
      case ProductionOrderStatus.PLANNED:
        items.push({
          key: ProductionOrderStatus.IN_PROGRESS,
          label: t("production.status.inProgress"),
        });
        items.push({
          key: ProductionOrderStatus.CANCELLED,
          label: t("production.status.cancelled"),
        });
        items.push({
          key: ProductionOrderStatus.ON_HOLD,
          label: t("production.status.onHold"),
        });
        break;
      case ProductionOrderStatus.IN_PROGRESS:
        items.push({
          key: ProductionOrderStatus.COMPLETED,
          label: t("production.status.completed"),
        });
        items.push({
          key: ProductionOrderStatus.ON_HOLD,
          label: t("production.status.onHold"),
        });
        break;
      case ProductionOrderStatus.ON_HOLD:
        items.push({
          key: ProductionOrderStatus.PLANNED,
          label: t("production.status.planned"),
        });
        items.push({
          key: ProductionOrderStatus.IN_PROGRESS,
          label: t("production.status.inProgress"),
        });
        break;
    }

    return items;
  };

  const columns = [
    {
      title: t("production.bomName"),
      dataIndex: ["bom", "name"],
      key: "bomName",
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        a.bom.name.localeCompare(b.bom.name),
    },
    {
      title: t("production.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: ProductionOrder) => (
        <span>
          {record.completedQuantity} / {quantity}
        </span>
      ),
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        a.quantity - b.quantity,
    },
    {
      title: t("production.status"),
      dataIndex: "status",
      key: "status",
      render: (status: ProductionOrderStatus) => (
        <Tag color={getStatusTagColor(status)}>{getStatusLabel(status)}</Tag>
      ),
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        a.status.localeCompare(b.status),
    },
    {
      title: t("production.priority"),
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={getPriorityTagColor(priority)}>
          {getPriorityLabel(priority)}
        </Tag>
      ),
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        a.priority.localeCompare(b.priority),
    },
    {
      title: t("production.plannedDate"),
      dataIndex: "plannedStartDate",
      key: "plannedStartDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: ProductionOrder, b: ProductionOrder) =>
        new Date(a.plannedStartDate).getTime() -
        new Date(b.plannedStartDate).getTime(),
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: any, record: ProductionOrder) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onView(record)}
            title={t("common.view")}
          />

          {record.status !== ProductionOrderStatus.COMPLETED && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
              title={t("common.edit")}
            />
          )}

          {record.status === ProductionOrderStatus.IN_PROGRESS && (
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              size="small"
              onClick={() => onRecordProduction(record)}
              title={t("production.recordProduction")}
            />
          )}

          {record.status === ProductionOrderStatus.PLANNED && (
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => onDelete(record)}
              title={t("common.delete")}
            />
          )}

          {/* Status update dropdown */}
          {record.status !== ProductionOrderStatus.COMPLETED &&
            record.status !== ProductionOrderStatus.CANCELLED && (
              <Dropdown
                menu={{
                  items: getStatusMenuItems(record).map((item) => ({
                    key: item.key,
                    label: item.label,
                    onClick: () =>
                      onUpdateStatus(record, item.key as ProductionOrderStatus),
                  })),
                }}
              >
                <Button size="small">
                  {t("production.changeStatus")} <DownOutlined />
                </Button>
              </Dropdown>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
}
