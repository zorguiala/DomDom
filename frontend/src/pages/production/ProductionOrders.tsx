import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import productionService, {
  ProductionOrder,
} from "../../services/production.service";

const { Option } = Select;

const statusColors = {
  planned: "default",
  in_progress: "processing",
  completed: "success",
  cancelled: "error",
};

const ProductionOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await productionService.getOrders();
      setOrders(data);
    } catch (error) {
      message.error("Failed to fetch production orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (values: any) => {
    try {
      await productionService.createOrder({
        ...values,
        plannedStartDate: values.plannedStartDate.toDate(),
      });
      message.success("Production order created successfully");
      setIsCreateModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      message.error("Failed to create production order");
    }
  };

  const columns: ColumnsType<ProductionOrder> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "BOM",
      dataIndex: ["bom", "name"],
      key: "bom",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag
          color={
            priority === "high"
              ? "red"
              : priority === "medium"
              ? "orange"
              : "blue"
          }
        >
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Completed",
      dataIndex: "completedQuantity",
      key: "completedQuantity",
    },
    {
      title: "Planned Start",
      dataIndex: "plannedStartDate",
      key: "plannedStartDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/production/orders/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Production Orders"
        extra={
          <Button type="primary" onClick={() => setIsCreateModalVisible(true)}>
            Create Order
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title="Create Production Order"
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrder} layout="vertical">
          <Form.Item
            name="bomId"
            label="Bill of Materials"
            rules={[{ required: true, message: "Please select a BOM" }]}
          >
            <Select placeholder="Select BOM">
              {/* Add BOM options here */}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="plannedStartDate"
            label="Planned Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select placeholder="Select priority">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Order
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductionOrders;
