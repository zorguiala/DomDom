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
} from "antd";
import productionService, {
  ProductionOrder,
} from "../../services/production.service";
import BatchTrackingPanel from '../../components/production/BatchTrackingPanel';

const { TextArea } = Input;
const { Option } = Select;

const statusColors = {
  planned: "default",
  in_progress: "processing",
  completed: "success",
  cancelled: "error",
};

const ProductionOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await productionService.getOrder(id);
      setOrder(data);
    } catch (error) {
      message.error("Failed to fetch production order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    try {
      await productionService.updateOrderStatus(id, newStatus);
      message.success("Status updated successfully");
      fetchOrder();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleRecordProduction = async (values: any) => {
    if (!id) return;
    try {
      await productionService.recordProduction(id, values);
      message.success("Production recorded successfully");
      setIsRecordModalVisible(false);
      form.resetFields();
      fetchOrder();
    } catch (error) {
      message.error("Failed to record production");
    }
  };

  if (!order) {
    return null;
  }

  const progress = (order.completedQuantity / order.quantity) * 100;

  return (
    <div style={{ padding: "24px" }}>
      <Card loading={loading}>
        <Descriptions title="Production Order Details" bordered>
          <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[order.status]}>
              {order.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            <Tag
              color={
                order.priority === "high"
                  ? "red"
                  : order.priority === "medium"
                  ? "orange"
                  : "blue"
              }
            >
              {order.priority.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="BOM">{order.bom.name}</Descriptions.Item>
          <Descriptions.Item label="Planned Start Date">
            {new Date(order.plannedStartDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Actual Start Date">
            {order.actualStartDate
              ? new Date(order.actualStartDate).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Target Quantity">
            {order.quantity}
          </Descriptions.Item>
          <Descriptions.Item label="Completed Quantity">
            {order.completedQuantity}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {order.assignedTo?.name || "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Card title="Production Progress">
          <Progress
            percent={Math.round(progress)}
            status={progress >= 100 ? "success" : "active"}
          />
        </Card>

        <Divider />

        <Space>
          {order.status === "planned" && (
            <Button
              type="primary"
              onClick={() => handleStatusUpdate("in_progress")}
            >
              Start Production
            </Button>
          )}
          {order.status === "in_progress" && (
            <>
              <Button
                type="primary"
                onClick={() => setIsRecordModalVisible(true)}
              >
                Record Production
              </Button>
              <Button onClick={() => handleStatusUpdate("completed")}>
                Complete Order
              </Button>
            </>
          )}
          {["planned", "in_progress"].includes(order.status) && (
            <Button danger onClick={() => handleStatusUpdate("cancelled")}>
              Cancel Order
            </Button>
          )}
        </Space>
      </Card>

      {order.isBatchProduction && (
        <div style={{ marginTop: 16 }}>
          <BatchTrackingPanel 
            productionOrderId={order.id} 
            refreshData={fetchOrder}
          />
        </div>
      )}

      <Modal
        title="Record Production"
        visible={isRecordModalVisible}
        onCancel={() => setIsRecordModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRecordProduction} layout="vertical">
          <Form.Item
            name="quantity"
            label="Quantity Produced"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: "Please select an employee" }]}
          >
            <Select placeholder="Select employee">
              {/* Add employee options here */}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Record Production
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductionOrderDetail;
