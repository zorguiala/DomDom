import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  LineChartOutlined,
  TeamOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
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
  Cell,
} from "recharts";
import { dashboardApi } from "../services/api";

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
  severity: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
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
  status: "Completed" | "Failed" | "In Progress";
}

interface SaleRecord {
  id: string;
  date: string;
  amount: number;
  customer: string;
}

interface InventoryAlert {
  id: string;
  product: string;
  currentStock: number;
  minStock: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor,
}) => (
  <Card>
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Space>
        <div style={{ color: iconColor, fontSize: "24px" }}>{icon}</div>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
      </Space>
      <Text style={{ fontSize: "24px" }}>{value}</Text>
      <Text type={change >= 0 ? "success" : "danger"}>
        {change >= 0 ? "+" : ""}
        {change}% from last period
      </Text>
    </Space>
  </Card>
);

const AlertItem: React.FC<AlertProps> = ({
  severity,
  title,
  message,
  timestamp,
}) => {
  const getIcon = () => {
    switch (severity) {
      case "error":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "warning":
        return <WarningOutlined style={{ color: "#faad14" }} />;
      case "info":
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
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
    sales: { today: 0, change: 0 },
    inventory: { total: 0, lowStock: 0 },
    efficiency: { value: 0, change: 0 },
    employees: { present: 0, total: 0, change: 0 },
  });
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [salesData, setSalesData] = useState<
    Array<{ date: string; directSales: number; commercialSales: number }>
  >([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatusItem[]>(
    []
  );
  const [productionData, setProductionData] = useState<ProductionDataItem[]>(
    []
  );
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Create an array of API calls with error handling
        const apiCalls = [
          // Essential data - wrap each in try/catch
          dashboardApi.getInventoryStats().catch((err) => {
            console.error("Error fetching inventory stats:", err);
            return { totalProducts: 0, totalValue: 0, lowStockProducts: 0, outOfStockProducts: 0 };
          }),

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dashboardApi.getTodaysSales().catch(() => [
            { id: "1", date: "2025-04-27", amount: 1000, customer: "John Doe" },
            { id: "2", date: "2025-04-28", amount: 2000, customer: "Jane Doe" },
            { id: "3", date: "2025-04-29", amount: 3000, customer: "Bob Smith" },
          ]),

          // Optional data - these endpoints might not be fully implemented yet
          dashboardApi.getProductionEfficiency().catch(() => ({
            value: 85,
            change: 5,
          })),

          dashboardApi.getEmployeePresence().catch(() => ({
            present: 8,
            total: 10,
            change: 0,
          })),

          dashboardApi.getSalesOverview(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString()
          ).catch(() => [
            // Fallback sample data for chart
            { date: "2025-04-27", directSales: 7500, commercialSales: 5200 },
            { date: "2025-04-28", directSales: 8000, commercialSales: 5500 },
            { date: "2025-04-29", directSales: 9000, commercialSales: 6000 },
            { date: "2025-04-30", directSales: 8500, commercialSales: 5800 },
            { date: "2025-05-01", directSales: 9500, commercialSales: 6500 },
            { date: "2025-05-02", directSales: 10000, commercialSales: 7000 },
            { date: "2025-05-03", directSales: 9800, commercialSales: 6800 },
          ]),

          dashboardApi.getInventoryStatus().catch(() => [
            { name: "In Stock", value: 65, color: "#52c41a" },
            { name: "Low Stock", value: 25, color: "#faad14" },
            { name: "Out of Stock", value: 10, color: "#ff4d4f" },
          ]),

          dashboardApi.getProductionOutput().catch(() => [
            { product: "Premium Chocolate Bar", planned: 500, actual: 480, variance: -20 },
            { product: "Vanilla Ice Cream", planned: 300, actual: 320, variance: 20 },
            { product: "Strawberry Yogurt", planned: 800, actual: 750, variance: -50 },
            { product: "Caramel Sauce", planned: 200, actual: 190, variance: -10 },
          ]),

          dashboardApi.getRecentActivities().catch(() => [
            {
              id: "1",
              description: "New sales order created",
              user: "Admin User",
              module: "Sales",
              timestamp: new Date().toISOString(),
              status: "Completed",
            },
          ]),

          dashboardApi.getSystemAlerts().catch(() => [
            {
              severity: "warning" as const,
              title: "Low Stock Alert",
              message: "5 products are below minimum stock levels",
              timestamp: new Date().toISOString(),
            },
          ]),
          dashboardApi.getRecentSales().catch(() => [
            { id: "1", date: "2025-04-27", amount: 1000, customer: "John Doe" },
            { id: "2", date: "2025-04-28", amount: 2000, customer: "Jane Doe" },
            { id: "3", date: "2025-04-29", amount: 3000, customer: "Bob Smith" },
          ]),
          dashboardApi.getLowStockAlerts().catch(() => [
            { id: "1", product: "Product A", currentStock: 50, minStock: 100 },
            { id: "2", product: "Product B", currentStock: 200, minStock: 150 },
            { id: "3", product: "Product C", currentStock: 300, minStock: 200 },
          ]),
        ];

        // Execute all API calls in parallel
        const results = await Promise.all(apiCalls);

        const inventoryMapped = {
          total: (results[0] as any).totalProducts ?? (results[0] as any).total ?? 0,
          lowStock: (results[0] as any).lowStockProducts ?? (results[0] as any).lowStock ?? 0
        };

        const salesMapped = {
          today: (results[1] as any).totalRevenue ?? (results[1] as any).totalSales ?? 0,
          change: (results[1] as any).change ?? 0,
        };

        setStats({
          sales: salesMapped,
          inventory: inventoryMapped,
          efficiency: results[2],
          employees: results[3],
        });

        setSalesData(results[4]);
        setInventoryStatus(results[5]);
        setProductionData(results[6]);
        setActivities(results[7]);
        setAlerts(results[8]);
        setRecentSales(results[9]);
        setInventoryAlerts(results[10]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const productionColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Planned",
      dataIndex: "planned",
      key: "planned",
      align: "right" as const,
    },
    {
      title: "Actual",
      dataIndex: "actual",
      key: "actual",
      align: "right" as const,
    },
    {
      title: "Variance",
      dataIndex: "variance",
      key: "variance",
      align: "right" as const,
      render: (variance: number) => (
        <Tag color={variance >= 0 ? "success" : "error"}>
          {variance >= 0 ? "+" : ""}
          {variance}
        </Tag>
      ),
    },
  ];

  const activityColumns = [
    { title: "Activity", dataIndex: "description", key: "description" },
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Module", dataIndex: "module", key: "module" },
    {
      title: "Date & Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Completed"
            ? "success"
            : status === "Failed"
            ? "error"
            : "warning";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const recentSalesColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
  ];

  const inventoryAlertsColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
    },
    {
      title: "Minimum Stock",
      dataIndex: "minStock",
      key: "minStock",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {/* Stats Cards */}
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          title="Total Inventory Items"
          value={stats.inventory.total ?? 0}
          change={0}
          icon={<ShoppingOutlined />}
          iconColor="#1890ff"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          title="Today's Sales"
          value={`$${stats.sales.today.toLocaleString()}`}
          change={stats.sales.change ?? 0}
          icon={<DollarOutlined />}
          iconColor="#52c41a"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          title="Production Efficiency"
          value={`${stats.efficiency.value}%`}
          change={stats.efficiency.change ?? 0}
          icon={<LineChartOutlined />}
          iconColor="#faad14"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          title="Employees Present"
          value={`${stats.employees.present}/${stats.employees.total}`}
          change={stats.employees.change ?? 0}
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
            dataSource={productionData || []}
            columns={productionColumns}
            pagination={false}
            size="small"
          />
        </Card>
      </Col>

      {/* System Alerts */}
      <Col xs={24} md={8}>
        <Card>
          <Title level={5}>System Alerts</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            {alerts.map((alert, index) => (
              <AlertItem key={index} {...alert} />
            ))}
          </Space>
        </Card>
      </Col>

      {/* Recent Sales */}
      <Col xs={24}>
        <Card>
          <Title level={5}>Recent Sales</Title>
          <Table
            dataSource={recentSales || []}
            columns={recentSalesColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      </Col>

      {/* Inventory Alerts */}
      <Col xs={24}>
        <Card>
          <Title level={5}>Inventory Alerts</Title>
          <Table
            dataSource={inventoryAlerts || []}
            columns={inventoryAlertsColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </Col>

      {/* Recent Activities */}
      <Col xs={24}>
        <Card>
          <Title level={5}>Recent Activities</Title>
          <Table
            dataSource={activities || []}
            columns={activityColumns}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );
}
