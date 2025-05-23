import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { ExclamationCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StockMetrics, StockItem } from "../../services/stock-service";

interface MetricsCardsProps {
  metrics: StockMetrics | null;
  lowStockItems: StockItem[];
  topSellingItems: StockItem[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  metrics,
  lowStockItems,
  topSellingItems,
}) => {
  const { t } = useTranslation();

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card>
          <Statistic
            title={t("stock.totalValue")}
            value={metrics?.totalValue || 0}
            precision={2}
            valueStyle={{ color: "#3f8600" }}
            prefix="€"
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
              lowStockItems.length > 0 ? <ExclamationCircleOutlined /> : null
            }
            suffix={`/${metrics?.totalProducts || 0}`}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title={t("stock.topSellingItems")}
            value={topSellingItems.length}
            valueStyle={{ color: "#1890ff" }}
            prefix={<TrophyOutlined />}
            suffix=""
          />
        </Card>
      </Col>
    </Row>
  );
};

export default MetricsCards;
