import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Progress, Table, Tag, Space, Spin, Alert } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  LineChartOutlined,
  TeamOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';

const { Title, Text } = Typography;

// Types
interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconColor: string;
}

interface AlertProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
}

interface InventoryStatusItem {
  name: string;
  value: number;
  color: string;
}

interface ProductionDataItem {
  product: string;
  planned: number;
  actual: number;
  variance: number;
}

interface ActivityItem {
  id: string;
  description: string;
  user: string;
  module: string;
  timestamp: string;
  status: 'Completed' | 'Failed' | 'In Progress';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, iconColor }) => (
  <Card>
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space>
        <div style={{ color: iconColor, fontSize: '24px' }}>{icon}</div>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
      </Space>
      <Text style={{ fontSize: '24px' }}>{value}</Text>
      <Text type={change >= 0 ? 'success' : 'danger'}>
        {change >= 0 ? '+' : ''}{change}% from last period
      </Text>
    </Space>
  </Card>
);

const AlertItem: React.FC<AlertProps> = ({ severity, title, message, time }) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  return (
    <Alert
      icon={getIcon()}
      message={title}
      description={message}
      type={severity}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    inventory: { total: 0, change: 0 },
    sales: { total: 0, change: 0 },
    efficiency: { value: 0, change: 0 },
    employees: { present: 0, total: 0, change: 0 },
  });
  const [salesData, setSalesData] = useState<Array<{ date: string; directSales: number; commercialSales: number }>>([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatusItem[]>([]);
  const [productionData, setProductionData] = useState<ProductionDataItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          inventoryStats,
          todaysSales,
          productionEfficiency,
          employeePresence,
          salesOverview,
          inventoryStatusData,
          productionOutput,
          recentActivities,
          systemAlerts,
        ] = await Promise.all([
          dashboardApi.getInventoryStats(),
          dashboardApi.getTodaysSales(),
          dashboardApi.getProductionEfficiency(),
          dashboardApi.getEmployeePresence(),
          dashboardApi.getSalesOverview(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString()
          ),
          dashboardApi.getInventoryStatus(),
          dashboardApi.getProductionOutput(),
          dashboardApi.getRecentActivities(),
          dashboardApi.getSystemAlerts(),
        ]);

        setStats({
          inventory: inventoryStats,
          sales: todaysSales,
          efficiency: productionEfficiency,
          employees: employeePresence,
        });
        setSalesData(salesOverview);
        setInventoryStatus(inventoryStatusData);
        setProductionData(productionOutput);
        setActivities(recentActivities);
        setAlerts(systemAlerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  const productionColumns = [
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'Planned', dataIndex: 'planned', key: 'planned', align: 'right' },
    { title: 'Actual', dataIndex: 'actual', key: 'actual', align: 'right' },
    {
      title: 'Variance',
      dataIndex: 'variance',
      key: 'variance',
      align: 'right',
      render: (variance: number) => (
        <Tag color={variance >= 0 ? 'success' : 'error'}>
          {variance}%
        </Tag>
      ),
    },
  ];

  const activityColumns = [
    { title: 'Activity', dataIndex: 'description', key: 'description' },
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Completed' ? 'success' : status === 'Failed' ? 'error' : 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <DashboardLayout>
      <Row gutter={[16, 16]}>
        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Total Inventory Items"
            value={stats.inventory.total}
            change={stats.inventory.change}
            icon={<ShoppingOutlined />}
            iconColor="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Today's Sales"
            value={`$${stats.sales.total.toLocaleString()}`}
            change={stats.sales.change}
            icon={<DollarOutlined />}
            iconColor="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Production Efficiency"
            value={`${stats.efficiency.value}%`}
            change={stats.efficiency.change}
            icon={<LineChartOutlined />}
            iconColor="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="Employees Present"
            value={`${stats.employees.present}/${stats.employees.total}`}
            change={stats.employees.change}
            icon={<TeamOutlined />}
            iconColor="#722ed1"
          />
        </Col>

        {/* Charts */}
        <Col xs={24} md={16}>
          <Card>
            <Title level={5}>Sales Overview</Title>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="directSales"
                    stackId="1"
                    stroke="#1890ff"
                    fill="#1890ff"
                  />
                  <Area
                    type="monotone"
                    dataKey="commercialSales"
                    stackId="1"
                    stroke="#52c41a"
                    fill="#52c41a"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Inventory Status</Title>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {inventoryStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Production Output */}
        <Col xs={24} md={16}>
          <Card>
            <Title level={5}>Production Output</Title>
            <Table
              columns={productionColumns}
              dataSource={productionData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* System Alerts */}
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>System Alerts</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              {alerts.map((alert, index) => (
                <AlertItem key={index} {...alert} />
              ))}
            </Space>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24}>
          <Card>
            <Title level={5}>Recent Activities</Title>
            <Table
              columns={activityColumns}
              dataSource={activities}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}