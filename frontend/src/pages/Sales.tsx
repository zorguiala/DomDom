import { SalesList } from "../components/sales/sales-list";
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

export default function SalesPage() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>{t("sales.title", "Sales")}</Typography.Title>
      <SalesList />
    </div>
  );
}
