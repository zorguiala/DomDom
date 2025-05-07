import { useState } from "react";
import {
  Typography,
  Input,
  Switch,
  Button,
  notification,
  Spin,
  Space,
  Modal,
  Table,
  Drawer,
  Alert,
  Tabs,
} from "antd";
import type { TabsProps } from "antd";
import axios from "axios";
import {
  PlusOutlined,
  HistoryOutlined,
  SwapOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ExceptionOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../services/inventoryService";
import type { Product } from "../types/inventory";
import { ProductForm } from "../components/inventory/product-form";
import { StockTransactionForm } from "../components/inventory/stock-transaction-form";
import BatchList from "../components/inventory/batch-tracking/batch-list";
import CountList from "../components/inventory/inventory-count/count-list";
import WastageList from "../components/inventory/wastage-management/wastage-list";
import ForecastDashboard from "../components/inventory/inventory-forecast/forecast-dashboard";

const { Search } = Input;

export default function Inventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modal, contextHolder] = Modal.useModal(); // Using Modal.useModal hook for better modal management
  const [activeTab, setActiveTab] = useState("products");
  const [search, setSearch] = useState("");
  const [showRawMaterials, setShowRawMaterials] = useState<boolean | undefined>(
    undefined
  );
  const [showInactive, setShowInactive] = useState(false);
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
    queryKey: ["products", search, showRawMaterials, showInactive],
    queryFn: () =>
      inventoryApi.getProducts({
        search,
        isRawMaterial: showRawMaterials,
        isActive: showInactive ? undefined : true, // If showInactive is true, don't filter by isActive
      }),
  });

  // Low stock
  const { data: lowStock } = useQuery({
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
  // This handler will be implemented for the 'Add Product' button in a future update
  // const handleAddProduct = () => {
  //   setSelectedProduct(undefined);
  //   setFormOpen(true);
  // };
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  // Updated delete handler using the modal.confirm from useModal hook
  const handleDeleteProduct = (product: Product) => {
    modal.confirm({
      title: t("inventory.deleteConfirmation"),
      content: `${t("inventory.deleteProductConfirmMessage")} ${product.name}?`,
      okText: t("common.delete"),
      okType: "danger",
      cancelText: t("common.cancel"),
      centered: true,
      onOk: async () => {
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:3000/api";
          const token = localStorage.getItem("token");

          await axios.put(
            `${API_URL}/products/${product.id}`,
            { isActive: false },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          queryClient.invalidateQueries({ queryKey: ["products"] });

          notification.success({
            message: t("inventory.productDeleted"),
            description: `${product.name} ${t("inventory.hasBeenDeleted")}`,
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          notification.error({
            message: t("common.error"),
            description: t("inventory.errorDeletingProduct"),
          });
          return Promise.reject(error);
        }
      },
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
            record.initialStock <= record.minimumStock ? "text-red-500" : ""
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

  // Define tab items for the Tabs component
  const tabItems: TabsProps["items"] = [
    {
      key: "products",
      label: (
        <span>
          <PartitionOutlined />
          {t("inventory.products")}
        </span>
      ),
      children: (
        <div>
          <div className="controls">
            <Space style={{ marginBottom: 16 }}>
              <Search
                placeholder={t("inventory.searchProducts")}
                onSearch={(value) => setSearch(value)}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 250 }}
              />
              <Space>
                <Button
                  onClick={() =>
                    setShowRawMaterials((prev) =>
                      prev === undefined
                        ? true
                        : prev === true
                        ? false
                        : undefined
                    )
                  }
                >
                  {showRawMaterials === undefined
                    ? t("inventory.showAll")
                    : showRawMaterials
                    ? t("inventory.showRawMaterials")
                    : t("inventory.showProducts")}
                </Button>
                <Switch
                  checked={showInactive}
                  onChange={setShowInactive}
                  checkedChildren={t("inventory.showInactive")}
                  unCheckedChildren={t("inventory.hideInactive")}
                />
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedProduct(undefined);
                  setFormOpen(true);
                }}
              >
                {t("inventory.addProduct")}
              </Button>
            </Space>
          </div>

          {isLoading ? (
            <div className="loading-spinner">
              <Spin size="large" />
            </div>
          ) : lowStock && lowStock.length > 0 ? (
            <Alert
              type="warning"
              message={t("inventory.lowStockAlert")}
              description={lowStock
                .map((p: Product) => `${p.name} (${p.initialStock})`)
                .join(", ")}
              showIcon
            />
          ) : (
            <Table
              columns={columns}
              dataSource={products || []}
              loading={isLoading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      ),
    },
    {
      key: "batch-tracking",
      label: (
        <span>
          <BarChartOutlined />
          {t("inventory.batch.batchTracking")}
        </span>
      ),
      children: <BatchList />,
    },
    {
      key: "inventory-count",
      label: (
        <span>
          <CalendarOutlined />
          {t("inventory.inventoryCount.title")}
        </span>
      ),
      children: <CountList />,
    },
    {
      key: "wastage-management",
      label: (
        <span>
          <ExceptionOutlined />
          {t("inventory.wastageManagement.title")}
        </span>
      ),
      children: <WastageList />,
    },
    {
      key: "forecasting",
      label: (
        <span>
          <BarChartOutlined />
          {t("inventory.inventoryForecast.title")}
        </span>
      ),
      children: <ForecastDashboard />,
    },
  ];

  return (
    <div className="inventory-page">
      {/* Include the contextHolder for the modal to work */}
      {contextHolder}

      <div className="header-section">
        <Typography.Title level={2}>{t("inventory.title")}</Typography.Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabPosition="top"
        style={{ marginBottom: 32 }}
        items={tabItems}
      />

      {formOpen && (
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
                createProduct.mutate(data as Omit<Product, "id">);
              }
            }}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}

      {transactionOpen && transactionProduct && (
        <Modal
          open={transactionOpen}
          onCancel={() => {
            setTransactionOpen(false);
            setTransactionProduct(undefined);
          }}
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
      )}

      <Drawer
        title={t("inventory.transactionHistory")}
        width={720}
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryProduct(undefined);
        }}
        extra={
          <span>
            {historyProduct?.name}{" "}
            {historyProduct?.sku ? `(${historyProduct.sku})` : ""}
          </span>
        }
      >
        {historyProduct && (
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
        )}
      </Drawer>

      <style>{`
        .inventory-page {
          padding: 20px;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .controls {
          display: flex;
          gap: 10px;
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
          margin-top: 100px;
        }
        .product-list {
          background: white;
          padding: 20px;
          border-radius: 5px;
        }
        .low-stock {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
