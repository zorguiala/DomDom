import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavBar } from "../components/NavBar";

export default function Production() {
  const { t } = useTranslation();

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("production.title")}
        </Typography>
        {/* TODO: Implement production management features */}
      </Container>
    </Box>
  );
}
