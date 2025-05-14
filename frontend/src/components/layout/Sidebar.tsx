// Rule: All static configuration objects (such as menuItems for navigation) must be placed in a separate file (e.g., sidebar-menu-items.ts) within the relevant feature or component folder. Always import them where needed.
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menuItems } from "./sidebar-menu-items"; // Import the menu items from a separate file

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: "100%", borderRight: 0 }}
      items={menuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: t(item.labelKey),
        onClick: () => navigate(item.key),
      }))}
    />
  );
}
