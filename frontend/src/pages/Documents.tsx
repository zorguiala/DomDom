import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavBar } from "../components/NavBar";

export default function Documents() {
  const { t } = useTranslation();

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("documents.title")}
        </Typography>
        {/* TODO: Implement document generation features */}
      </Container>
    </Box>
  );
}
