import { ReactNode } from "react";
import { TFunction } from "i18next";
import { ArrowUpOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import { ColumnsType } from "antd/es/table";
import { Product } from "../../../services/stock-service";

export const useDashboardColumns = (t: TFunction) => {
  const lowStockColumns: ColumnsType<Product> = [
    {
      title: t("stock.product"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("stock.currentStock"),
      dataIndex: "currentStock",
      key: "currentStock",
      render: (text: number, record: Product) => (
        <span>
          {text} {record.unit}
          {record.lowStockAlert && (
            <Alert
              message={t("stock.low")}
              type="warning"
              showIcon
              style={{ marginTop: 4, padding: "0 8px" }}
            />
          )}
        </span>
      ),
    },
    {
      title: t("stock.minimumStock"),
      dataIndex: "minimumStock",
      key: "minimumStock",
      render: (text: number, record: Product) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
  ];

  const profitableColumns: ColumnsType<Product> = [
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
      render: (_: ReactNode, record: Product) => (
        <span>${(record.price - record.costPrice).toFixed(2)}</span>
      ),
    },
  ];

  const topSellingColumns: ColumnsType<Product> = [
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
      render: (text: number, record: Product) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
  ];

  return {
    lowStockColumns,
    profitableColumns,
    topSellingColumns,
  };
};