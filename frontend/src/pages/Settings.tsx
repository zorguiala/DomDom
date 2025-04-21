import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavBar } from "../components/NavBar";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("settings.title")}
        </Typography>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("settings.language")}
              </Typography>
              <LanguageSwitcher />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                {t("settings.theme")}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={toggleTheme}
                    name="darkMode"
                  />
                }
                label={t("settings.darkMode")}
              />
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
