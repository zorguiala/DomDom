import { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Input,
  Switch,
  Button,
  notification,
  Spin,
  Space,
  Modal,
  Table,
  Tag,
  Drawer,
  Alert,
  Form,
  InputNumber,
  Select,
} from "antd";
import {
  PlusOutlined,
  BarcodeOutlined,
  HistoryOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../services/inventoryService";
import type { Product } from "../types/inventory";
import { ProductForm } from "../components/inventory/product-form";
import { StockTransactionForm } from "../components/inventory/stock-transaction-form";

const { Search } = Input;
const { Option } = Select;

export default function Inventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showRawMaterials, setShowRawMaterials] = useState<boolean | undefined>(
    undefined
  );
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"in" | "out">("in");
  const [transactionProduct, setTransactionProduct] = useState<
    Product | undefined
  >();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState<Product | undefined>();

  // Product list
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, showRawMaterials],
    queryFn: () =>
      inventoryApi.getProducts({
        search,
        isRawMaterial: showRawMaterials,
        isActive: true,
      }),
  });

  // Low stock
  const { data: lowStock, isLoading: loadingLowStock } = useQuery({
    queryKey: ["lowStock"],
    queryFn: () => inventoryApi.getLowStockProducts(),
  });

  // Mutations
  const createProduct = useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notification.success({ message: t("inventory.productCreated") });
      setFormOpen(false);
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notification.success({ message: t("inventory.productUpdated") });
      setFormOpen(false);
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notification.success({ message: t("inventory.productDeleted") });
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  // Transaction history
  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions", historyProduct?.id],
    queryFn: () =>
      historyProduct?.id ? inventoryApi.getTransactions(historyProduct.id) : [],
    enabled: !!historyProduct,
  });

  // Handlers
  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setFormOpen(true);
  };
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };
  const handleDeleteProduct = (product: Product) => {
    Modal.confirm({
      title: t("inventory.deleteConfirmation"),
      onOk: () => deleteProduct.mutate(product.id),
    });
  };
  const handleStockTransaction = (product: Product, type: "in" | "out") => {
    setTransactionProduct(product);
    setTransactionType(type);
    setTransactionOpen(true);
  };
  const handleShowHistory = (product: Product) => {
    setHistoryProduct(product);
    setHistoryOpen(true);
  };

  // Table columns
  const columns = [
    {
      title: t("inventory.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Product) => (
        <span
          className={
            record.currentStock <= record.minimumStock ? "text-red-500" : ""
          }
        >
          {text}
        </span>
      ),
    },
    { title: t("inventory.sku"), dataIndex: "sku", key: "sku" },
    { title: t("inventory.barcode"), dataIndex: "barcode", key: "barcode" },
    { title: t("inventory.unit"), dataIndex: "unit", key: "unit" },
    {
      title: t("inventory.currentStock"),
      dataIndex: "currentStock",
      key: "currentStock",
    },
    {
      title: t("inventory.minimumStock"),
      dataIndex: "minimumStock",
      key: "minimumStock",
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => handleShowHistory(record)}
          />
          <Button
            icon={<SwapOutlined />}
            onClick={() => handleStockTransaction(record, "in")}
          >
            {t("inventory.stockIn")}
          </Button>
          <Button
            icon={<SwapOutlined />}
            onClick={() => handleStockTransaction(record, "out")}
          >
            {t("inventory.stockOut")}
          </Button>
          <Button onClick={() => handleEditProduct(record)}>
            {t("common.edit")}
          </Button>
          <Button danger onClick={() => handleDeleteProduct(record)}>
            {t("common.delete")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={2}>{t("inventory.title")}</Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            {t("inventory.addProduct")}
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12} lg={8}>
          <Search
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Switch
            checked={showRawMaterials === true}
            onChange={(checked) =>
              setShowRawMaterials(checked ? true : undefined)
            }
            checkedChildren={t("inventory.showRawMaterials")}
            unCheckedChildren={t("inventory.showProducts")}
          />
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {loadingLowStock ? (
        <Spin />
      ) : lowStock && lowStock.length > 0 ? (
        <Alert
          type="warning"
          message={t("inventory.lowStockAlert")}
          description={lowStock
            .map((p: Product) => `${p.name} (${p.currentStock})`)
            .join(", ")}
          showIcon
        />
      ) : null}

      {/* Products Table */}
      <Table
        columns={columns}
        dataSource={products || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Product Form Modal */}
      <Modal
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        title={
          selectedProduct
            ? t("inventory.editProduct")
            : t("inventory.addProduct")
        }
        footer={null}
        width={600}
        destroyOnClose
      >
        <ProductForm
          initialData={selectedProduct}
          onSubmit={(data) => {
            if (selectedProduct) {
              updateProduct.mutate({ id: selectedProduct.id, data });
            } else {
              createProduct.mutate(data);
            }
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* Stock Transaction Modal */}
      <Modal
        open={transactionOpen}
        onCancel={() => setTransactionOpen(false)}
        title={
          transactionType === "in"
            ? t("inventory.stockIn")
            : t("inventory.stockOut")
        }
        footer={null}
        width={400}
        destroyOnClose
      >
        <StockTransactionForm
          product={transactionProduct}
          type={transactionType}
          onSuccess={() => {
            setTransactionOpen(false);
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
          onCancel={() => setTransactionOpen(false)}
        />
      </Modal>

      {/* Transaction History Drawer */}
      <Drawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={t("inventory.transactionHistory")}
        width={600}
      >
        <Table
          columns={[
            {
              title: t("inventory.date"),
              dataIndex: "createdAt",
              key: "createdAt",
            },
            { title: t("inventory.type"), dataIndex: "type", key: "type" },
            {
              title: t("inventory.quantity"),
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: t("inventory.unitPrice"),
              dataIndex: "unitPrice",
              key: "unitPrice",
            },
            { title: t("inventory.notes"), dataIndex: "notes", key: "notes" },
          ]}
          dataSource={transactions || []}
          loading={loadingTransactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Drawer>
    </Space>
  );
}

// ProductForm and StockTransactionForm would be implemented in components/inventory/
// For brevity, you can use AntD Form, Input, InputNumber, etc. and pass props as above.
