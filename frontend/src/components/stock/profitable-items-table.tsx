import React from "react";
import { Card, Table } from "antd";
import { ArrowUpOutlined, LineChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { StockItem } from "../../services/stock-service";

interface ProfitableItemsTableProps {
  profitableItems: StockItem[];
}

const ProfitableItemsTable: React.FC<ProfitableItemsTableProps> = ({
  profitableItems,
}) => {
  const { t } = useTranslation();

  const profitableColumns = [
    {
      title: t("stock.item"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: StockItem) => (
        <span>
          {text}
          <small style={{ color: '#888', marginLeft: '5px' }}>
            {record.itemType === 'finished_product' ? t("stock.finishedProduct") : 
             record.itemType === 'raw_material' ? t("stock.rawMaterial") : 
             t("stock.packaging")}
          </small>
        </span>
      ),
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
      title: t("stock.sellingPrice"),
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (text: number) => (
        <span>
          {(Math.round(text * 100) / 100).toFixed(2)} €
        </span>
      ),
    },
  ];

  return (
    <Card
      title={t("stock.mostProfitableItems")}
      extra={<LineChartOutlined />}
      style={{ marginBottom: 16 }}
    >
      <Table
        dataSource={profitableItems}
        columns={profitableColumns}
        pagination={false}
        size="small"
        rowKey="id"
      />
    </Card>
  );
};

export default ProfitableItemsTable;
