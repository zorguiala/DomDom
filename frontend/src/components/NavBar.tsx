import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function NavBar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.primary.main,
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DomDom
        </Typography>

        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LanguageSwitcher />

            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label={t("settings.darkMode")}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Typography variant="body1" sx={{ mx: 2 }}>
              {t("common.welcome")}, {user.firstName}
            </Typography>

            <Button color="inherit" onClick={handleLogout}>
              {t("auth.logout")}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
