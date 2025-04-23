import { useQuery } from "@tanstack/react-query";
import { Box, Paper, Typography, Grid, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { inventoryApi } from "../../services/inventoryService";

export const InventoryOverview = () => {
  const { t } = useTranslation();

  const { data: lowStockData, isLoading: isLoadingLowStock } = useQuery({
    queryKey: ["lowStockAlerts"],
    queryFn: () => inventoryApi.getLowStockProducts(),
  });

  const { data: valuationData, isLoading: isLoadingValuation } = useQuery({
    queryKey: ["inventoryValuation"],
    queryFn: () =>
      inventoryApi.getInventoryReport(
        new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
        new Date()
      ),
  });

  if (isLoadingLowStock || isLoadingValuation) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        {t("inventory.overview")}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("inventory.lowStockItems")}
          </Typography>
          <Typography variant="h4">{lowStockData?.length || 0}</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("inventory.totalProducts")}
          </Typography>
          <Typography variant="h4">{valuationData?.length || 0}</Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("inventory.recentTransactions")}
          </Typography>
          {/* We'll add a small list of recent transactions here later */}
        </Grid>
      </Grid>
    </Paper>
  );
};
