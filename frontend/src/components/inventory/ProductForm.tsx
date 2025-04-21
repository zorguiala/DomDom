import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  initialData?: Product;
}

const defaultProduct: Product = {
  name: "",
  sku: "",
  description: "",
  price: 0,
  currentStock: 0,
  minimumStock: 0,
  unit: "",
  isRawMaterial: false,
  id: "",
  isActive: false,
  createdAt: "",
  updatedAt: "",
};

export function ProductForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ProductFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Product>(
    initialData || defaultProduct
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? t("inventory.editProduct") : t("inventory.addProduct")}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label={t("inventory.productName")}
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="sku"
                label={t("inventory.sku")}
                value={formData.sku}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="description"
                label={t("inventory.description")}
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="price"
                label={t("inventory.price")}
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="unit"
                label={t("inventory.unit")}
                value={formData.unit}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="currentStock"
                label={t("inventory.currentStock")}
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="minimumStock"
                label={t("inventory.minimumStock")}
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="isRawMaterial"
                    checked={formData.isRawMaterial}
                    onChange={handleChange}
                  />
                }
                label={t("inventory.isRawMaterial")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" variant="contained">
            {initialData ? t("common.save") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
