import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavBar } from "../components/NavBar";
import { BOMCard } from "../components/bom/BOMCard";
import { BOMForm } from "../components/bom/BOMForm";
import { BOMDetails } from "../components/bom/BOMDetails";
import { bomApi } from "../services/bomService";
import { BOM, BOMInput } from "../types/bom";

export default function BOMPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedBOM, setSelectedBOM] = useState<BOM | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Queries
  const { data: boms, isLoading } = useQuery({
    queryKey: ["boms", search],
    queryFn: () => bomApi.getBOMs(search),
  });

  // Mutations
  const createBOM = useMutation({
    mutationFn: bomApi.createBOM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      setNotification({ message: t("bom.createSuccess"), type: "success" });
      handleCloseForm();
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
    },
  });

  const updateBOM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BOMInput> }) =>
      bomApi.updateBOM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      setNotification({ message: t("bom.updateSuccess"), type: "success" });
      handleCloseForm();
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
    },
  });

  const deleteBOM = useMutation({
    mutationFn: bomApi.deleteBOM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      setNotification({ message: t("bom.deleteSuccess"), type: "success" });
    },
    onError: () => {
      setNotification({ message: t("common.error"), type: "error" });
    },
  });

  // Event Handlers
  const handleAddBOM = () => {
    setSelectedBOM(undefined);
    setFormOpen(true);
  };

  const handleEditBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setFormOpen(true);
  };

  const handleViewBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setDetailsOpen(true);
  };

  const handleDeleteBOM = (bom: BOM) => {
    if (window.confirm(t("bom.deleteConfirmation"))) {
      deleteBOM.mutate(bom.id);
    }
  };

  const handleSubmitBOM = (bomData: BOMInput) => {
    if (selectedBOM) {
      updateBOM.mutate({
        id: selectedBOM.id,
        data: bomData,
      });
    } else {
      createBOM.mutate(bomData);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedBOM(undefined);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBOM(undefined);
  };

  return (
    <Box>
      <NavBar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {t("bom.title")}
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddBOM}
          >
            {t("bom.addBom")}
          </Button>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                label={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* BOMs Grid */}
        {isLoading ? (
          <Typography>{t("common.loading")}</Typography>
        ) : (
          <Grid container spacing={3}>
            {boms?.map((bom: BOM) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={bom.id}>
                <BOMCard
                  bom={bom}
                  onView={handleViewBOM}
                  onEdit={handleEditBOM}
                  onDelete={handleDeleteBOM}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* BOM Form Dialog */}
        <BOMForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitBOM}
          initialData={selectedBOM}
        />

        {/* BOM Details Dialog */}
        {selectedBOM && detailsOpen && (
          <BOMDetails
            open={detailsOpen}
            onClose={handleCloseDetails}
            bom={selectedBOM}
          />
        )}

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
