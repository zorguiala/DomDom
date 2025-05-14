import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Alert,
  Spin,
  Typography,
} from "antd";
import {
  ArrowUpOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useStockMetrics } from "../../hooks/useStockMetrics";

const { Title } = Typography;

const StockDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    metrics,
    lowStockItems,
    mostProfitableProducts,
    topSellingProducts,
    loading,
    error,
  } = useStockMetrics();

  const lowStockColumns = [
    {
      title: t("stock.product"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("stock.currentStock"),
      dataIndex: "currentStock",
      key: "currentStock",
      render: (text: number, record: any) => (
        <span>
          {text} {record.unit}
          {record.lowStockAlert && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              <ExclamationCircleOutlined /> {t("stock.low")}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: t("stock.minimumStock"),
      dataIndex: "minimumStock",
      key: "minimumStock",
      render: (text: number, record: any) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
  ];

  const profitableColumns = [
    {
      title: t("stock.product"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("stock.profitMargin"),
      dataIndex: "profitMargin",
      key: "profitMargin",
      render: (text: number) => (
        <span>
          <ArrowUpOutlined style={{ color: "#3f8600" }} /> {text.toFixed(2)}%
        </span>
      ),
    },
    {
      title: t("stock.profit"),
      key: "profit",
      render: (_: any, record: any) => (
        <span>${(record.price - record.costPrice).toFixed(2)}</span>
      ),
    },
  ];

  const topSellingColumns = [
    {
      title: t("stock.product"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("stock.price"),
      dataIndex: "price",
      key: "price",
      render: (text: number) => `$${text.toFixed(2)}`,
    },
    {
      title: t("stock.currentStock"),
      dataIndex: "currentStock",
      key: "currentStock",
      render: (text: number, record: any) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
  ];

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <div className="stock-dashboard">
      <Title level={2}>{t("stock.dashboardTitle")}</Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t("stock.totalValue")}
                  value={metrics?.totalValue || 0}
                  precision={2}
                  valueStyle={{ color: "#3f8600" }}
                  prefix="$"
                  suffix=""
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t("stock.lowStockItems")}
                  value={lowStockItems.length}
                  valueStyle={{
                    color: lowStockItems.length > 0 ? "#cf1322" : "#3f8600",
                  }}
                  prefix={
                    lowStockItems.length > 0 ? (
                      <ExclamationCircleOutlined />
                    ) : null
                  }
                  suffix={`/${metrics?.totalProducts || 0}`}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t("stock.topSellingItems")}
                  value={topSellingProducts.length}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<TrophyOutlined />}
                  suffix=""
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Card
                title={t("stock.lowStockItems")}
                extra={<LineChartOutlined />}
                style={{ marginBottom: 16 }}
              >
                <Table
                  dataSource={lowStockItems}
                  columns={lowStockColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={t("stock.mostProfitableItems")}
                extra={<LineChartOutlined />}
                style={{ marginBottom: 16 }}
              >
                <Table
                  dataSource={mostProfitableProducts}
                  columns={profitableColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={t("stock.topSellingItems")}
                extra={<LineChartOutlined />}
                style={{ marginBottom: 16 }}
              >
                <Table
                  dataSource={topSellingProducts}
                  columns={topSellingColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default StockDashboard;
