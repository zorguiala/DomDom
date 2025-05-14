import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  DatePicker,
  Select,
  Button,
  Tag,
  Tooltip,
} from "antd";
import { useTranslation } from "react-i18next";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useStockTransactions } from "../../hooks/useStockTransactions";
import { useStock } from "../../hooks/useStock";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface StockTransactionHistoryProps {
  productId?: string;
  showFilters?: boolean;
}

const StockTransactionHistory: React.FC<StockTransactionHistoryProps> = ({
  productId,
  showFilters = true,
}) => {
  const { t } = useTranslation();
  const { products } = useStock();
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchProductHistory,
  } = useStockTransactions();

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    productId
  );
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  // Load transactions based on props and filters
  useEffect(() => {
    if (productId) {
      setSelectedProduct(productId);
      fetchProductHistory(productId);
    } else {
      fetchTransactions();
    }
  }, [productId]);

  // Handle filter changes
  const handleFilterChange = () => {
    const filters: any = {};

    if (selectedProduct) {
      filters.productId = selectedProduct;
    }

    if (selectedType) {
      filters.type = selectedType;
    }

    if (dateRange) {
      filters.startDate = dateRange[0].format("YYYY-MM-DD");
      filters.endDate = dateRange[1].format("YYYY-MM-DD");
    }

    fetchTransactions(filters);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedProduct(productId);
    setSelectedType(undefined);
    setDateRange(null);

    if (productId) {
      fetchProductHistory(productId);
    } else {
      fetchTransactions();
    }
  };

  // Get product name from ID
  const getProductName = (id: string) => {
    const product = products.find((p) => p.id === id);
    return product ? product.name : id;
  };

  // Columns for the transactions table
  const columns = [
    {
      title: t("stock.date"),
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: t("stock.product"),
      dataIndex: "productId",
      key: "productId",
      render: (id: string) => getProductName(id),
      // Only show this column if not filtering by product
      hidden: !!productId || !!selectedProduct,
    },
    {
      title: t("stock.type"),
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        let color = "";
        switch (type) {
          case "addition":
            color = "green";
            break;
          case "removal":
            color = "red";
            break;
          case "transfer":
            color = "blue";
            break;
          case "adjustment":
            color = "orange";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{t(`stock.${type}`)}</Tag>;
      },
    },
    {
      title: t("stock.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => {
        const prefix =
          record.type === "addition" || record.type === "adjustment"
            ? "+"
            : "-";
        return (
          <span
            style={{
              color:
                record.type === "addition" || record.type === "adjustment"
                  ? "green"
                  : "red",
            }}
          >
            {prefix}
            {quantity}
          </span>
        );
      },
    },
    {
      title: t("stock.reason"),
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => reason || "-",
    },
    {
      title: t("stock.location"),
      key: "location",
      render: (_: any, record: any) => {
        if (record.type === "transfer") {
          return (
            <Tooltip
              title={`${t("stock.from")} ${record.sourceLocation} ${t(
                "stock.to"
              )} ${record.destinationLocation}`}
            >
              <span>
                {record.sourceLocation} → {record.destinationLocation}
              </span>
            </Tooltip>
          );
        }
        return "-";
      },
    },
    {
      title: t("stock.reference"),
      dataIndex: "referenceNumber",
      key: "referenceNumber",
      render: (ref: string) => ref || "-",
    },
    {
      title: t("common.notes"),
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
  ].filter((col) => !col.hidden);

  return (
    <Card className="stock-transaction-history">
      <Title level={3}>
        {productId ? t("stock.productHistory") : t("stock.transactionHistory")}
      </Title>

      {showFilters && (
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <Space wrap>
            {!productId && (
              <Select
                placeholder={t("stock.selectProduct")}
                style={{ width: 200 }}
                allowClear
                value={selectedProduct}
                onChange={setSelectedProduct}
              >
                {products.map((product) => (
                  <Option key={product.id} value={product.id}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            )}

            <Select
              placeholder={t("stock.transactionType")}
              style={{ width: 150 }}
              allowClear
              value={selectedType}
              onChange={setSelectedType}
            >
              <Option value="addition">{t("stock.addition")}</Option>
              <Option value="removal">{t("stock.removal")}</Option>
              <Option value="transfer">{t("stock.transfer")}</Option>
              <Option value="adjustment">{t("stock.adjustment")}</Option>
            </Select>

            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
              }
            />

            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleFilterChange}
            >
              {t("common.filter")}
            </Button>

            <Button icon={<ReloadOutlined />} onClick={handleResetFilters}>
              {t("common.reset")}
            </Button>
          </Space>
        </div>
      )}

      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {error && <div className="error-message">{error}</div>}
    </Card>
  );
};

export default StockTransactionHistory;
