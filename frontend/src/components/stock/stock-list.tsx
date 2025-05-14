import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Card,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStock } from "../../hooks/useStock";

const { Title } = Typography;

interface StockListProps {
  onViewHistory?: (productId: string) => void;
  onEdit?: (productId: string) => void;
}

const StockList: React.FC<StockListProps> = ({ onViewHistory, onEdit }) => {
  const { t } = useTranslation();
  const { products, loading, error } = useStock();
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (products) {
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [products, searchText]);

  const columns = [
    {
      title: t("stock.product"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("stock.sku"),
      dataIndex: "sku",
      key: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
    },
    {
      title: t("stock.currentStock"),
      dataIndex: "currentStock",
      key: "currentStock",
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (text, record) => (
        <span>
          {text} {record.unit}
          {record.lowStockAlert && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              <ExclamationCircleOutlined /> {t("stock.low")}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: t("stock.minimumStock"),
      dataIndex: "minimumStock",
      key: "minimumStock",
      render: (text, record) => (
        <span>
          {text} {record.unit}
        </span>
      ),
    },
    {
      title: t("stock.price"),
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: t("stock.costPrice"),
      dataIndex: "costPrice",
      key: "costPrice",
      sorter: (a, b) => a.costPrice - b.costPrice,
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: t("stock.profitMargin"),
      dataIndex: "profitMargin",
      key: "profitMargin",
      sorter: (a, b) => a.profitMargin - b.profitMargin,
      render: (text) => `${text.toFixed(2)}%`,
    },
    {
      title: t("stock.stockValue"),
      dataIndex: "totalValueInStock",
      key: "totalValueInStock",
      sorter: (a, b) => a.totalValueInStock - b.totalValueInStock,
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {onEdit && (
            <Tooltip title={t("common.edit")}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record.id)}
              />
            </Tooltip>
          )}
          {onViewHistory && (
            <Tooltip title={t("stock.viewHistory")}>
              <Button
                type="text"
                icon={<HistoryOutlined />}
                onClick={() => onViewHistory(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="stock-list">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3}>{t("stock.stockItems")}</Title>
        <Space>
          <Input
            placeholder={t("common.search")}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Link to="/stock/new">
            <Button type="primary">{t("stock.addProduct")}</Button>
          </Link>
        </Space>
      </div>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {error && <div className="error-message">{error}</div>}
    </Card>
  );
};

export default StockList;
