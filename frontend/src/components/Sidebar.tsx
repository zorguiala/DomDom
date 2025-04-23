import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
} from "@mui/material";
import {
  Home,
  Inventory,
  Build,
  ShoppingCart,
  People,
  Description,
  Settings,
  Notifications,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const menuItems = [
  { path: "/", icon: <Home />, labelKey: "home.title" },
  { path: "/inventory", icon: <Inventory />, labelKey: "inventory.title" },
  { path: "/production", icon: <Build />, labelKey: "production.title" },
  { path: "/sales", icon: <ShoppingCart />, labelKey: "sales.title" },
  { path: "/employees", icon: <People />, labelKey: "employees.title" },
  { path: "/documents", icon: <Description />, labelKey: "documents.title" },
  { path: "/reminders", icon: <Notifications />, labelKey: "reminders.title" },
  { path: "/settings", icon: <Settings />, labelKey: "settings.title" },
];

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.labelKey)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
