import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavBar } from "../components/NavBar";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Inventory Overview */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                {t("inventory.title")}
              </Typography>
              {/* TODO: Add inventory stats */}
            </Paper>
          </Grid>

          {/* Production Overview */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                {t("production.title")}
              </Typography>
              {/* TODO: Add production stats */}
            </Paper>
          </Grid>

          {/* Sales Overview */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                {t("sales.title")}
              </Typography>
              {/* TODO: Add sales stats */}
            </Paper>
          </Grid>

          {/* Employee Overview */}
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                {t("employees.title")}
              </Typography>
              {/* TODO: Add employee stats */}
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Recent Activity
              </Typography>
              {/* TODO: Add activity feed */}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
