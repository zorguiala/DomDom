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

export const menuItems = [
  { key: "/", icon: <HomeOutlined />, labelKey: "home.title" },
  { key: "/inventory", icon: <ShopOutlined />, labelKey: "inventory.title" },
  { key: "/production", icon: <BuildOutlined />, labelKey: "production.title" },
  { key: "/sales", icon: <ShoppingCartOutlined />, labelKey: "sales.title" },
  { key: "/employees", icon: <TeamOutlined />, labelKey: "employees.title" },
  {
    key: "/documents",
    icon: <FileTextOutlined />,
    labelKey: "documents.title",
  },
  { key: "/reminders", icon: <BellOutlined />, labelKey: "reminders.title" },
  { key: "/settings", icon: <SettingOutlined />, labelKey: "settings.title" },
];
