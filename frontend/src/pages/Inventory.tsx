import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { ProductCard } from "../components/inventory/ProductCard";
import { ProductForm } from "../components/inventory/ProductForm";
import { inventoryApi } from "../services/inventoryService";
import type { Product } from "../types/inventory";

export default function Inventory() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showRawMaterials, setShowRawMaterials] = useState<boolean | undefined>(
    undefined
  );
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
      setNotification({
        message: t("inventory.productCreated"),
        type: "success",
      });
      handleCloseForm();
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setNotification({
        message: t("inventory.productUpdated"),
        type: "success",
      });
      handleCloseForm();
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setNotification({
        message: t("inventory.productDeleted"),
        type: "success",
      });
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
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
    if (window.confirm(t("inventory.deleteConfirmation"))) {
      deleteProduct.mutate(product.id);
    }
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
    <Box>
      <NavBar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {t("inventory.title")}
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
          >
            {t("inventory.addProduct")}
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} lg={4}>
              <TextField
                fullWidth
                label={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showRawMaterials === true}
                    onChange={(e) =>
                      setShowRawMaterials(e.target.checked ? true : undefined)
                    }
                  />
                }
                label={t("inventory.showRawMaterials")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Products Grid */}
        {isLoading ? (
          <Typography>{t("common.loading")}</Typography>
        ) : (
          <Grid container spacing={3}>
            {/* Stats Section */}
            <Grid item xs={12} md={6} lg={4}>
              {/* Add your stats components here */}
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              {/* Add your stats components here */}
            </Grid>

            {/* Products Section */}
            {products?.map((product: Product) => (
              <Grid item xs={12} md={6} lg={4} key={product.id}>
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Product Form Dialog */}
        <ProductForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitProduct}
          initialData={selectedProduct}
        />

        {/* Notifications */}
        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity={notification?.type}
            sx={{ width: "100%" }}
          >
            {notification?.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
