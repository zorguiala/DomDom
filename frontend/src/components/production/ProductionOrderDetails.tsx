import {
  Modal,
  Typography,
  Descriptions,
  Progress,
  Button,
  Table,
  Tag,
  Spin,
} from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { productionApi } from "../../services/productionServices/productionApi";
import { ProductionOrder, ProductionOrderStatus } from "../../types/production";

const { Title, Text } = Typography;

interface ProductionOrderDetailsProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onRecordProduction: (order: ProductionOrder) => void;
  onUpdateStatus: (status: ProductionOrderStatus) => void;
}

export function ProductionOrderDetails({
  open,
  onClose,
  orderId,
  onRecordProduction,
  onUpdateStatus,
}: ProductionOrderDetailsProps) {
  const { t } = useTranslation();

  // Fetch order details
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["production-order-details", orderId],
    queryFn: () => productionApi.getOrderById(orderId),
    enabled: open && Boolean(orderId),
  });

  // Fetch production progress
  const { isLoading: isLoadingProgress } = useQuery({
    queryKey: ["production-order-progress", orderId],
    queryFn: () => productionApi.getProductionProgress(orderId),
    enabled: open && Boolean(orderId),
  });

  // Fetch production records
  const { data: records, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["production-records", orderId],
    queryFn: () => productionApi.getProductionRecords(orderId),
    enabled: open && Boolean(orderId),
  });

  const isLoading = isLoadingDetails || isLoadingProgress || isLoadingRecords;

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

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return t("production.priority.high");
      case "medium":
        return t("production.priority.medium");
      case "low":
        return t("production.priority.low");
      default:
        return priority || "-";
    }
  };

  const recordColumns = [
    {
      title: t("production.employee"),
      dataIndex: ["employee", "name"],
      key: "employee",
    },
    {
      title: t("production.quantity"),
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: t("production.recordedOn"),
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t("production.startTime"),
      dataIndex: "startTime",
      key: "startTime",
      render: (date: string) =>
        date ? new Date(date).toLocaleTimeString() : "-",
    },
    {
      title: t("production.notes"),
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
  ];

  // Calculate percent complete
  const percentComplete =
    orderDetails && orderDetails.quantity > 0
      ? (orderDetails.completedQuantity / orderDetails.quantity) * 100
      : 0;

  return (
    <Modal
      title={t("production.orderDetails")}
      open={open}
      onCancel={onClose}
      footer={[
        orderDetails?.status === ProductionOrderStatus.PLANNED && (
          <Button
            key="start"
            type="primary"
            onClick={() => onUpdateStatus(ProductionOrderStatus.IN_PROGRESS)}
          >
            {t("production.startProduction")}
          </Button>
        ),
        orderDetails?.status === ProductionOrderStatus.IN_PROGRESS && (
          <Button
            key="record"
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => onRecordProduction(orderDetails)}
          >
            {t("production.recordProduction")}
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          {t("common.close")}
        </Button>,
      ]}
      width={800}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Descriptions bordered column={2}>
            <Descriptions.Item label={t("production.status")} span={2}>
              <Tag
                color={getStatusTagColor(
                  orderDetails?.status || ProductionOrderStatus.PLANNED
                )}
              >
                {getStatusLabel(
                  orderDetails?.status || ProductionOrderStatus.PLANNED
                )}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("production.bomName")} span={2}>
              {orderDetails?.bom.name}
            </Descriptions.Item>
            <Descriptions.Item label={t("production.quantity")}>
              {orderDetails?.quantity}
            </Descriptions.Item>
            <Descriptions.Item label={t("production.completed")}>
              {orderDetails?.completedQuantity} ({percentComplete.toFixed(1)}%)
            </Descriptions.Item>
            <Descriptions.Item label={t("production.priority")}>
              {getPriorityLabel(orderDetails?.priority)}
            </Descriptions.Item>
            <Descriptions.Item label={t("production.plannedStartDate")}>
              {orderDetails?.plannedStartDate
                ? new Date(orderDetails.plannedStartDate).toLocaleDateString()
                : "-"}
            </Descriptions.Item>
            {orderDetails?.actualStartDate && (
              <Descriptions.Item label={t("production.actualStartDate")}>
                {new Date(orderDetails.actualStartDate).toLocaleString()}
              </Descriptions.Item>
            )}
            {orderDetails?.completedDate && (
              <Descriptions.Item label={t("production.completedDate")}>
                {new Date(orderDetails.completedDate).toLocaleString()}
              </Descriptions.Item>
            )}
            {orderDetails?.assignedTo && (
              <Descriptions.Item label={t("production.assignedTo")}>
                {orderDetails.assignedTo.firstName}
              </Descriptions.Item>
            )}
            {orderDetails?.notes && (
              <Descriptions.Item label={t("common.notes")} span={2}>
                {orderDetails.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div style={{ marginTop: 24 }}>
            <Title level={4}>{t("production.progress")}</Title>
            <Progress
              percent={Number(percentComplete.toFixed(1))}
              status={
                orderDetails?.status === ProductionOrderStatus.COMPLETED
                  ? "success"
                  : "active"
              }
              strokeWidth={20}
            />
          </div>

          {records && records.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>{t("production.productionRecords")}</Title>
              <Table
                columns={recordColumns}
                dataSource={records}
                rowKey="id"
                pagination={false}
              />
            </div>
          )}

          {(!records || records.length === 0) && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Text type="secondary">{t("production.noRecords")}</Text>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
