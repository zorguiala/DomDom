import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BOM, BOMInput, BOMItemInput } from "../../types/bom";
import { Product } from "../../types/inventory";
import { inventoryApi } from "../../services/inventoryService";
import { ProductSelect } from "../inventory/ProductSelect";

interface BOMFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BOMInput) => void;
  initialData?: BOM;
}

export function BOMForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: BOMFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BOMInput>({
    name: "",
    description: "",
    outputQuantity: 0,
    outputUnit: "",
    items: [],
  });

  // Query for raw materials
  const { data: rawMaterials } = useQuery({
    queryKey: ["products", { isRawMaterial: true }],
    queryFn: () => inventoryApi.getProducts({ isRawMaterial: true }),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        outputQuantity: initialData.outputQuantity,
        outputUnit: initialData.outputUnit,
        items: initialData.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unit: item.unit,
          wastagePercent: item.wastagePercent,
        })),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        outputQuantity: 0,
        outputUnit: "",
        items: [],
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantity: 0,
          unit: "",
          wastagePercent: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof BOMItemInput,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? t("bom.editBom") : t("bom.createBom")}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label={t("bom.name")}
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="outputQuantity"
                label={t("bom.outputQuantity")}
                type="number"
                value={formData.outputQuantity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="outputUnit"
                label={t("bom.outputUnit")}
                value={formData.outputUnit}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="description"
                label={t("bom.description")}
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/* BOM Items Section */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">{t("bom.materials")}</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  variant="outlined"
                  size="small"
                >
                  {t("bom.addMaterial")}
                </Button>
              </Box>

              {formData.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <ProductSelect
                        value={item.productId}
                        onChange={(value) =>
                          handleItemChange(index, "productId", value)
                        }
                        products={rawMaterials || []}
                        label={t("bom.material")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        label={t("bom.quantity")}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value)
                          )
                        }
                        fullWidth
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        label={t("bom.unit")}
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        label={t("bom.wastagePercent")}
                        type="number"
                        value={item.wastagePercent || 0}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "wastagePercent",
                            parseFloat(e.target.value)
                          )
                        }
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                      <IconButton
                        onClick={() => handleRemoveItem(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formData.items.length === 0}
          >
            {initialData ? t("common.save") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
