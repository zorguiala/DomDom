import { Typography, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { InventoryOverview } from "../components/dashboard/InventoryOverview";
import { SalesOverview } from "../components/dashboard/SalesOverview";
import { ProductionOverview } from "../components/dashboard/ProductionOverview";

const { Title } = Typography;

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Title level={2}>{t("dashboard.title")}</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <SalesOverview />
        </Col>

        <Col xs={24} md={12}>
          <InventoryOverview />
        </Col>

        <Col xs={24} md={12}>
          <ProductionOverview />
        </Col>
      </Row>
    </>
  );
}
