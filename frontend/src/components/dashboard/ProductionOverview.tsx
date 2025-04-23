import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { productionApi } from "../../services/productionService";

export const ProductionOverview = () => {
  const { t } = useTranslation();

  const { data: productionOrders, isLoading } = useQuery({
    queryKey: ["activeProductionOrders"],
    queryFn: () => productionApi.getActiveOrders(),
  });

  const { data: productionStats } = useQuery({
    queryKey: ["productionStats"],
    queryFn: () =>
      productionApi.getProductionStats(
        new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
        new Date()
      ),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  interface ProductionOrder {
    status: "in_progress" | "completed" | "planned";
  }

  const inProgressOrders: ProductionOrder[] =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "in_progress"
    ) || [];
  const completedOrders =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "completed"
    ) || [];
  const plannedOrders =
    productionOrders?.filter(
      (order: ProductionOrder) => order.status === "planned"
    ) || [];

  const efficiency = productionStats?.efficiency || 75; // Fallback to 75% if not available

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        {t("production.overview")}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("production.inProgress")}
          </Typography>
          <Typography variant="h4">{inProgressOrders.length}</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("production.completed")}
          </Typography>
          <Typography variant="h4">{completedOrders.length}</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("production.planned")}
          </Typography>
          <Typography variant="h4">{plannedOrders.length}</Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {t("production.currentEfficiency")}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={efficiency}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 1, display: "block" }}
          >
            {efficiency}%
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
