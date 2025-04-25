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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductCard } from "../components/inventory/ProductCard";
import { ProductForm } from "../components/inventory/ProductForm";
import { inventoryApi } from "../services/inventoryService";
import type { Product } from "../types/inventory";

const { Search } = Input;

export default function Inventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showRawMaterials, setShowRawMaterials] = useState<boolean | undefined>(
    undefined
  );
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  // Queries
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search, showRawMaterials],
    queryFn: () =>
      inventoryApi.getProducts({
        search,
        isRawMaterial: showRawMaterials,
        isActive: true,
      }),
  });

  // Mutations
  const createProduct = useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      notification.success({ message: t("inventory.productCreated") });
      handleCloseForm();
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
      handleCloseForm();
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

  // Event Handlers
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

  const handleSubmitProduct = (productData: Omit<Product, "id">) => {
    if (selectedProduct) {
      updateProduct.mutate({
        id: selectedProduct.id,
        data: productData,
      });
    } else {
      createProduct.mutate(productData);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedProduct(undefined);
  };

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            {t("inventory.addProduct")}
          </Button>
        </div>

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

        {/* Products Grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {products?.map((product: Product) => (
              <Col xs={24} md={12} lg={8} key={product.id}>
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </Col>
            ))}
          </Row>
        )}
      </Space>

      {/* Product Form Modal */}
      <ProductForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitProduct}
        initialData={selectedProduct}
      />
    </>
  );
}
