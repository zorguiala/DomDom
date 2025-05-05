import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  Divider,
  Progress,
  message,
  Tabs,
} from "antd";
import { useTranslation } from "react-i18next";
import ProductionService from "../../services/production.service";
import { ProductionOrder, ProductionOrderStatus } from "../../types/production";
import BatchTrackingPanel from '../../components/production/BatchTrackingPanel';
import QualityControlDashboard from '../../components/production/QualityControlDashboard';
import NotificationsPanel from '../../components/production/NotificationsPanel';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const statusColors: Record<string, string> = {
  planned: "default",
  in_progress: "processing",
  completed: "success",
  cancelled: "error",
  on_hold: "warning",
};

const ProductionOrderDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ProductionService.getProductionOrder(id);
      setOrder(data);
    } catch (error) {
      message.error(t("production.fetchOrderError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: ProductionOrderStatus) => {
    if (!id) return;
    try {
      await ProductionService.updateProductionOrderStatus(id, { status: newStatus });
      message.success(t("production.statusUpdateSuccess"));
      fetchOrder();
    } catch (error) {
      message.error(t("production.statusUpdateError"));
    }
  };

  const handleRecordProduction = async (values: any) => {
    if (!id) return;
    try {
      await ProductionService.recordProduction(id, values);
      message.success(t("production.recordSuccess"));
      setIsRecordModalVisible(false);
      form.resetFields();
      fetchOrder();
    } catch (error) {
      message.error(t("production.recordError"));
    }
  };

  if (!order) {
    return null;
  }

  const progress = (order.completedQuantity / order.quantity) * 100;

  return (
    <div style={{ padding: "24px" }}>
      <Card loading={loading}>
        <Descriptions title={t("production.orderDetails")} bordered>
          <Descriptions.Item label={t("production.orderId")}>{order.id}</Descriptions.Item>
          <Descriptions.Item label={t("production.status")}>
            <Tag color={statusColors[order.status]}>
              {t(`production.status.${order.status}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("production.priority")}>
            <Tag
              color={
                order.priority === "high"
                  ? "red"
                  : order.priority === "medium"
                  ? "orange"
                  : "blue"
              }
            >
              {t(`production.priority.${order.priority}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("production.bom")}>{order.bom.name}</Descriptions.Item>
          <Descriptions.Item label={t("production.plannedStartDate")}>
            {new Date(order.plannedStartDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label={t("production.actualStartDate")}>
            {order.actualStartDate
              ? new Date(order.actualStartDate).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("production.targetQuantity")}>
            {order.quantity}
          </Descriptions.Item>
          <Descriptions.Item label={t("production.completedQuantity")}>
            {order.completedQuantity}
          </Descriptions.Item>
          <Descriptions.Item label={t("production.assignedTo")}>
            {order.assignedTo 
              ? `${order.assignedTo.firstName || ''} ${order.assignedTo.lastName || ''}`.trim() 
              : "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Card title={t("production.progress")}>
          <Progress
            percent={Math.round(progress)}
            status={progress >= 100 ? "success" : "active"}
          />
        </Card>

        <Divider />

        <Space>
          {order.status === ProductionOrderStatus.PLANNED && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate(ProductionOrderStatus.IN_PROGRESS)}
            >
              {t("production.startProduction")}
            </Button>
          )}
          {order.status === ProductionOrderStatus.IN_PROGRESS && (
            <>
              <Button
                type="primary"
                onClick={() => setIsRecordModalVisible(true)}
              >
                {t("production.recordProduction")}
              </Button>
              <Button onClick={() => handleStatusUpdate(ProductionOrderStatus.COMPLETED)}>
                {t("production.completeOrder")}
              </Button>
            </>
          )}
          {[ProductionOrderStatus.PLANNED, ProductionOrderStatus.IN_PROGRESS].includes(order.status) && (
            <Button danger onClick={() => handleStatusUpdate(ProductionOrderStatus.CANCELLED)}>
              {t("production.cancelOrder")}
            </Button>
          )}
        </Space>
      </Card>

      <Tabs defaultActiveKey="batch" style={{ marginTop: 16 }}>
        {order.isBatchProduction && (
          <TabPane tab={t("production.batch.tracking")} key="batch">
            <BatchTrackingPanel 
              productionOrderId={order.id} 
              refreshData={fetchOrder}
            />
          </TabPane>
        )}
        
        <TabPane tab={t("production.quality.control")} key="quality">
          <QualityControlDashboard />
        </TabPane>
        
        <TabPane tab={t("production.notifications")} key="notifications">
          <NotificationsPanel />
        </TabPane>
      </Tabs>

      <Modal
        title={t("production.recordProduction")}
        open={isRecordModalVisible}
        onCancel={() => setIsRecordModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRecordProduction} layout="vertical">
          <Form.Item
            name="quantity"
            label={t("production.quantity")}
            rules={[{ required: true, message: t("validation.required", { field: t("production.quantity") }) }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label={t("production.employee")}
            rules={[{ required: true, message: t("validation.required", { field: t("production.employee") }) }]}
          >
            <Select placeholder={t("production.selectEmployee")}>
              {/* Add employee options here */}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label={t("production.notes")}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t("production.recordProduction")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductionOrderDetail;
