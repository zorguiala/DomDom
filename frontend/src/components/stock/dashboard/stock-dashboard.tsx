import React from "react";
import { Row, Col, Alert, Spin, Typography } from "antd";
import { ExclamationCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useStockMetrics } from "../../../hooks/useStockMetrics";
import MetricCard from "./metric-card";
import StockDataTable from "./stock-data-table";
import { useDashboardColumns } from "./use-dashboard-columns";

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

  const { lowStockColumns, profitableColumns, topSellingColumns } =
    useDashboardColumns(t);

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
              <MetricCard
                title={t("stock.totalValue")}
                value={metrics?.totalValue || 0}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix="$"
              />
            </Col>
            <Col span={8}>
              <MetricCard
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
            </Col>
            <Col span={8}>
              <MetricCard
                title={t("stock.topSellingItems")}
                value={topSellingProducts.length}
                valueStyle={{ color: "#1890ff" }}
                prefix={<TrophyOutlined />}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <StockDataTable
                title={t("stock.lowStockItems")}
                dataSource={lowStockItems}
                columns={lowStockColumns}
                rowKey="id"
              />
            </Col>
            <Col span={8}>
              <StockDataTable
                title={t("stock.mostProfitableItems")}
                dataSource={mostProfitableProducts}
                columns={profitableColumns}
                rowKey="id"
              />
            </Col>
            <Col span={8}>
              <StockDataTable
                title={t("stock.topSellingItems")}
                dataSource={topSellingProducts}
                columns={topSellingColumns}
                rowKey="id"
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default StockDashboard;