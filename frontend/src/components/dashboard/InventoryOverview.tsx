import { Card, Typography, Row, Col, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../../services/inventoryService";

const { Title, Text } = Typography;

export function InventoryOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["inventory-overview"],
    queryFn: inventoryApi.getOverview,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Title level={4}>{t("inventory.totalProducts")}</Title>
          <Text>{data?.totalProducts || 0}</Text>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Title level={4}>{t("inventory.lowStock")}</Title>
          <Text>{data?.lowStockCount || 0}</Text>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Title level={4}>{t("inventory.outOfStock")}</Title>
          <Text>{data?.outOfStockCount || 0}</Text>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Title level={4}>{t("inventory.totalValue")}</Title>
          <Text>${data?.totalValue?.toFixed(2) || "0.00"}</Text>
        </Card>
      </Col>
    </Row>
  );
}
