import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t } = useTranslation();

  const isLowStock = product.currentStock <= product.minimumStock;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" component="div">
            {product.name}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => onEdit(product)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(product)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Typography color="text.secondary" gutterBottom>
          SKU: {product.sku}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {product.description}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            {t("inventory.price")}: ${product.price}
          </Typography>
          <Typography variant="body2">
            {t("inventory.unit")}: {product.unit}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Chip
            label={`${t("inventory.stock")}: ${product.currentStock} ${
              product.unit
            }`}
            color={isLowStock ? "warning" : "default"}
          />
          {product.isRawMaterial && (
            <Chip
              label={t("inventory.rawMaterial")}
              color="info"
              size="small"
            />
          )}
          {isLowStock && (
            <Chip
              label={t("inventory.lowStock")}
              color="warning"
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
