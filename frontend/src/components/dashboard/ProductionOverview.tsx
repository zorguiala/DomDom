import { useQuery } from "@tanstack/react-query";
import { Card, Typography, Row, Col, Spin, Progress } from "antd";
import { useTranslation } from "react-i18next";
import { productionApi } from "../../services/productionService";

const { Title, Text } = Typography;

export const ProductionOverview = () => {
  const { t } = useTranslation();

  const { data: productionOrders, isLoading } = useQuery({
    queryKey: ["activeProductionOrders"],
    queryFn: () => productionApi.getActiveOrders(),
  });

  const { data: productionStats } = useQuery({
    queryKey: ["productionStats"],
    queryFn: () =>
      productionApi.getProductionStats(
        new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
        new Date()
      ),
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  interface ProductionOrder {
    status: "in_progress" | "completed" | "planned";
  }

  const inProgressOrders: ProductionOrder[] =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "in_progress"
    ) || [];
  const completedOrders =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "completed"
    ) || [];
  const plannedOrders =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "planned"
    ) || [];

  const efficiency = productionStats?.efficiency || 75; // Fallback to 75% if not available

  return (
    <Card>
      <Title
        level={4}
        style={{ color: "var(--ant-primary-color)", marginBottom: 24 }}
      >
        {t("production.overview")}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <div>
            <Text type="secondary">{t("production.inProgress")}</Text>
            <Title level={2} style={{ margin: "8px 0" }}>
              {inProgressOrders.length}
            </Title>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div>
            <Text type="secondary">{t("production.completed")}</Text>
            <Title level={2} style={{ margin: "8px 0" }}>
              {completedOrders.length}
            </Title>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div>
            <Text type="secondary">{t("production.planned")}</Text>
            <Title level={2} style={{ margin: "8px 0" }}>
              {plannedOrders.length}
            </Title>
          </div>
        </Col>

        <Col span={24}>
          <Text type="secondary">{t("production.currentEfficiency")}</Text>
          <Progress
            percent={efficiency}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            strokeWidth={10}
            style={{ marginTop: 8 }}
          />
        </Col>
      </Row>
    </Card>
  );
};
