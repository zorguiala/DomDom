import React from "react";
import { Card, Table, Tag } from "antd";
import { ExclamationCircleOutlined, LineChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StockItem } from "../../services/stock-service";

interface LowStockTableProps {
  lowStockItems: StockItem[];
}

const LowStockTable: React.FC<LowStockTableProps> = ({ lowStockItems }) => {
  const { t } = useTranslation();

  const lowStockColumns = [
    {
      title: t("stock.item"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: StockItem) => (
        <span>
          {text}
          <small style={{ color: "#888", marginLeft: "5px" }}>
            {record.itemType}
          </small>
        </span>
      ),
    },
    {
      title: t("stock.currentQuantity"),
      dataIndex: "currentQuantity",
      key: "currentQuantity",
      render: (text: number, record: StockItem) => (
        <span>
          {text} {record.unit}
          {record.currentQuantity <= record.minimumQuantity && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              <ExclamationCircleOutlined /> {t("stock.low")}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: t("stock.minimumQuantity"),
      dataIndex: "minimumQuantity",
      key: "minimumQuantity",
      render: (text: number, record: StockItem) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
  ];

  return (
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
  );
};

export default LowStockTable;
