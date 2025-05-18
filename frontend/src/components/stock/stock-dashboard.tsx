import React from "react";
import {
  Row,
  Col,
  Alert,
  Spin,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useStockMetrics } from "../../hooks/useStockMetrics";

// Import our new modular components
import MetricsCards from "./metrics-cards";
import LowStockTable from "./low-stock-table";
import ProfitableItemsTable from "./profitable-items-table";
import TopSellingItemsTable from "./top-selling-items-table";

const { Title } = Typography;

const StockDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    metrics,
    lowStockItems,
    mostProfitableItems,
    topSellingItems,
    loading,
    error,
  } = useStockMetrics();

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
          <MetricsCards 
            metrics={metrics}
            lowStockItems={lowStockItems}
            topSellingItems={topSellingItems}
          />

          <Row gutter={16}>
            <Col span={8}>
              <LowStockTable lowStockItems={lowStockItems} />
            </Col>
            <Col span={8}>
              <ProfitableItemsTable profitableItems={mostProfitableItems} />
            </Col>
            <Col span={8}>
              <TopSellingItemsTable topSellingItems={topSellingItems} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default StockDashboard;
