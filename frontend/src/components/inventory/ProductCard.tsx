import { Card, Typography, Button, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t } = useTranslation();

  const stockStatus =
    product.currentStock <= product.minimumStock ? "error" : "success";

  return (
    <Card
      actions={[
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(product)}
        >
          {t("common.edit")}
        </Button>,
        <Button
          key="delete"
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDelete(product)}
        >
          {t("common.delete")}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Title level={5}>{product.name}</Typography.Title>
        <Typography.Text type="secondary">SKU: {product.sku}</Typography.Text>

        <Space>
          <Tag color={stockStatus}>
            {t("inventory.stock")}: {product.currentStock} {product.unit}
          </Tag>
          {product.isRawMaterial && (
            <Tag color="blue">{t("inventory.rawMaterial")}</Tag>
          )}
        </Space>

        <Typography.Text>
          {t("inventory.price")}: ${product.price.toFixed(2)}
        </Typography.Text>
      </Space>
    </Card>
  );
}
