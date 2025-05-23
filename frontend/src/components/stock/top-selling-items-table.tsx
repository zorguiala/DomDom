import React from "react";
import { Card, Table } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StockItem } from "../../services/stock-service";

interface TopSellingItemsTableProps {
  topSellingItems: StockItem[];
}

const TopSellingItemsTable: React.FC<TopSellingItemsTableProps> = ({
  topSellingItems,
}) => {
  const { t } = useTranslation();

  const topSellingColumns = [
    {
      title: t("stock.item"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: StockItem) => (
        <span>
          {text}
          <small style={{ color: '#888', marginLeft: '5px' }}>{record.itemType}</small>
        </span>
      ),
    },
    {
      title: t("stock.totalSold"),
      dataIndex: "totalSold",
      key: "totalSold",
      render: (text: number, record: StockItem) => (
        <span>
          {text} {record.unit}
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
        </span>
      ),
    },
  ];

  return (
    <Card
      title={t("stock.topSellingItems")}
      extra={<LineChartOutlined />}
      style={{ marginBottom: 16 }}
    >
      <Table
        dataSource={topSellingItems}
        columns={topSellingColumns}
        pagination={false}
        size="small"
        rowKey="id"
      />
    </Card>
  );
};

export default TopSellingItemsTable;
