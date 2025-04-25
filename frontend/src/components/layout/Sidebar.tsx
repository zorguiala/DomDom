import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  ShopOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Sider } = Layout;

const menuItems = [
  { key: "/", icon: <HomeOutlined />, labelKey: "home.title" },
  { key: "/inventory", icon: <ShopOutlined />, labelKey: "inventory.title" },
  { key: "/production", icon: <BuildOutlined />, labelKey: "production.title" },
  { key: "/sales", icon: <ShoppingCartOutlined />, labelKey: "sales.title" },
  { key: "/employees", icon: <TeamOutlined />, labelKey: "employees.title" },
  { key: "/documents", icon: <FileTextOutlined />, labelKey: "documents.title" },
  { key: "/reminders", icon: <BellOutlined />, labelKey: "reminders.title" },
  { key: "/settings", icon: <SettingOutlined />, labelKey: "settings.title" },
];

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={240}
      style={{
        background: "#fff",
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: t(item.labelKey),
          onClick: () => navigate(item.key),
        }))}
      />
    </Sider>
  );
} 