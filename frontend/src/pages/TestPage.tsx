import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Table, Space, message, Row, Col, Select, Typography, Divider, Statistic, Alert } from 'antd';
import { UserOutlined, ShoppingCartOutlined, FileTextOutlined, TeamOutlined, InboxOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

// Interfaces based on backend DTOs
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ProductionOrder {
  id: string;
  bomId: string;
  quantity: number;
  plannedStartDate: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

interface Document {
  id: string;
  documentType: string;
  title: string;
  createdAt: Date;
}

interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unitPrice: number;
  reference?: string;
}

const TestPage: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0
  });
  const [messageApi, contextHolder] = message.useMessage();

  // API endpoints
  const API_BASE_URL = 'http://localhost:3000/api';
  const ENDPOINTS = {
    users: `${API_BASE_URL}/users`,
    productionOrders: `${API_BASE_URL}/production/orders`,
    documents: `${API_BASE_URL}/documents`,
    inventory: `${API_BASE_URL}/inventory`,
    attendance: `${API_BASE_URL}/attendance`,
  };

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchProductionOrders();
    fetchDocuments();
    fetchInventoryStats();
  }, []);

  // API calls
  const fetchUsers = async () => {
    try {
      const response = await axios.get(ENDPOINTS.users);
      setUsers(response.data);
    } catch (error) {
      messageApi.error('Failed to fetch users');
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const response = await axios.get(ENDPOINTS.productionOrders);
      setProductionOrders(response.data);
    } catch (error) {
      messageApi.error('Failed to fetch production orders');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(ENDPOINTS.documents);
      setDocuments(response.data);
    } catch (error) {
      messageApi.error('Failed to fetch documents');
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.inventory}/stats`);
      setInventoryStats(response.data);
    } catch (error) {
      messageApi.error('Failed to fetch inventory statistics');
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      const response = await axios.post(ENDPOINTS.users, values);
      messageApi.success('User created successfully');
      setUsers([...users, response.data]);
    } catch (error) {
      messageApi.error('Failed to create user');
    }
  };

  const handleCreateProductionOrder = async (values: any) => {
    try {
      const response = await axios.post(ENDPOINTS.productionOrders, values);
      messageApi.success('Production order created successfully');
      fetchProductionOrders();
    } catch (error) {
      messageApi.error('Failed to create production order');
    }
  };

  const handleCreateDocument = async (values: any) => {
    try {
      const response = await axios.post(ENDPOINTS.documents, values);
      messageApi.success('Document created successfully');
      fetchDocuments();
    } catch (error) {
      messageApi.error('Failed to create document');
    }
  };

  const handleInventoryUpdate = async (values: any) => {
    try {
      const response = await axios.post(`${ENDPOINTS.inventory}/transactions`, values);
      messageApi.success('Inventory updated successfully');
      fetchInventoryStats();
    } catch (error) {
      messageApi.error('Failed to update inventory');
    }
  };

  // Table columns
  const userColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      {contextHolder}
      <Content style={{ padding: '24px' }}>
        {/* Statistics Cards */}
        <Row gutter={[24, 24]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Inventory Items"
                value={inventoryStats.totalItems}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={inventoryStats.lowStockItems}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Production Orders"
                value={productionOrders.length}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Recent Documents"
                value={documents.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* User Management */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title={<Title level={4}>User Management</Title>}>
              <Form layout="vertical" onFinish={handleCreateUser}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, message: 'Please input email!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true, message: 'Please input first name!' }]}
                    >
                      <Input placeholder="First Name" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      rules={[{ required: true, message: 'Please input last name!' }]}
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Create User
                  </Button>
                </Form.Item>
              </Form>
              <Table columns={userColumns} dataSource={users} rowKey="id" />
            </Card>
          </Col>

          {/* Production Orders */}
          <Col span={24}>
            <Card title={<Title level={4}>Production Orders</Title>}>
              <Form layout="vertical" onFinish={handleCreateProductionOrder}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="BOM ID"
                      name="bomId"
                      rules={[{ required: true, message: 'Please select BOM!' }]}
                    >
                      <Select placeholder="Select BOM">
                        <Option value="bom1">BOM #1</Option>
                        <Option value="bom2">BOM #2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Quantity"
                      name="quantity"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <Input type="number" min={1} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Priority"
                      name="priority"
                      rules={[{ required: true, message: 'Please select priority!' }]}
                    >
                      <Select placeholder="Select priority">
                        <Option value="low">Low</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="high">High</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" icon={<ShoppingCartOutlined />} htmlType="submit">
                    Create Production Order
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Documents */}
          <Col span={24}>
            <Card title={<Title level={4}>Documents</Title>}>
              <Form layout="vertical" onFinish={handleCreateDocument}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Document Type"
                      name="documentType"
                      rules={[{ required: true, message: 'Please select document type!' }]}
                    >
                      <Select placeholder="Select type">
                        <Option value="invoice">Invoice</Option>
                        <Option value="bon_de_sortie">Bon de Sortie</Option>
                        <Option value="production_order">Production Order</Option>
                        <Option value="report">Report</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Title"
                      name="title"
                      rules={[{ required: true, message: 'Please input title!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Format"
                      name="format"
                      rules={[{ required: true, message: 'Please select format!' }]}
                    >
                      <Select placeholder="Select format">
                        <Option value="pdf">PDF</Option>
                        <Option value="docx">DOCX</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" icon={<FileTextOutlined />} htmlType="submit">
                    Generate Document
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Inventory Management */}
          <Col span={24}>
            <Card title={<Title level={4}>Inventory Management</Title>}>
              <Form layout="vertical" onFinish={handleInventoryUpdate}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Product"
                      name="productId"
                      rules={[{ required: true, message: 'Please select product!' }]}
                    >
                      <Select placeholder="Select product">
                        <Option value="prod1">Product 1</Option>
                        <Option value="prod2">Product 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Transaction Type"
                      name="type"
                      rules={[{ required: true, message: 'Please select type!' }]}
                    >
                      <Select placeholder="Select type">
                        <Option value="IN">Stock In</Option>
                        <Option value="OUT">Stock Out</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Quantity"
                      name="quantity"
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <Input type="number" min={1} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Unit Price"
                      name="unitPrice"
                      rules={[{ required: true, message: 'Please input unit price!' }]}
                    >
                      <Input type="number" min={0} step={0.01} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" icon={<InboxOutlined />} htmlType="submit">
                    Update Inventory
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default TestPage;
