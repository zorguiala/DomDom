import { Card, Typography, Row, Col, Spin, Statistic } from "antd";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { salesApi } from "../../services/salesService";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title } = Typography;

export function SalesOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["sales-overview"],
    queryFn: salesApi.getOverview,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const percentChange = data?.percentChange || 0;
  const isPositiveChange = percentChange >= 0;

  return (
    <Card>
      <Title level={4}>{t("sales.overview")}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title={t("sales.todaySales")}
            value={data?.todaySales || 0}
            precision={2}
            prefix="$"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title={t("sales.monthToDate")}
            value={data?.monthToDate || 0}
            precision={2}
            prefix="$"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title={t("sales.compareLastMonth")}
            value={percentChange}
            precision={1}
            prefix={
              isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />
            }
            suffix="%"
            valueStyle={{ color: isPositiveChange ? "#3f8600" : "#cf1322" }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Statistic
            title={t("sales.averageOrderValue")}
            value={data?.averageOrderValue || 0}
            precision={2}
            prefix="$"
          />
        </Col>
      </Row>
    </Card>
  );
}
