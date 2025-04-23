import { useQuery } from "@tanstack/react-query";
import { Box, Paper, Typography, Grid, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

export const SalesOverview = () => {
  const { t } = useTranslation();

  // Get sales data for the current month
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["monthlySales"],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(1); // First day of current month
      const endDate = new Date();

      const response = await fetch(
        `/api/sales/reports/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const totalSales = salesData?.totalAmount || 0;
  const totalOrders = salesData?.orders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        {t("sales.overview")}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("sales.monthlyRevenue")}
          </Typography>
          <Typography variant="h4">${totalSales.toFixed(2)}</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("sales.totalOrders")}
          </Typography>
          <Typography variant="h4">{totalOrders}</Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("sales.averageOrder")}
          </Typography>
          <Typography variant="h4">${averageOrderValue.toFixed(2)}</Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" color="textSecondary">
            {t("sales.recentOrders")}
          </Typography>
          {/* We'll add a small list of recent orders here later */}
        </Grid>
      </Grid>
    </Paper>
  );
};
