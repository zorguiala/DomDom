import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const { Sider } = Layout;

// Group menu items by category
const menuItems = {
  main: [
    { path: "/", icon: <HomeOutlined />, labelKey: "home.title" },
    {
      path: "/inventory",
      icon: <ShoppingOutlined />,
      labelKey: "inventory.title",
    },
    {
      path: "/production",
      icon: <ToolOutlined />,
      labelKey: "production.title",
    },
    { path: "/sales", icon: <ShoppingCartOutlined />, labelKey: "sales.title" },
  ],
  management: [
    { path: "/employees", icon: <TeamOutlined />, labelKey: "employees.title" },
    {
      path: "/documents",
      icon: <FileTextOutlined />,
      labelKey: "documents.title",
    },
  ],
  system: [
    { path: "/reminders", icon: <BellOutlined />, labelKey: "reminders.title" },
    {
      path: "/settings",
      icon: <SettingOutlined />,
      labelKey: "settings.title",
    },
  ],
};

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();

  const getMenuItem = (item: (typeof menuItems.main)[0]) => ({
    key: item.path,
    icon: item.icon,
    label: t(item.labelKey),
    onClick: () => navigate(item.path),
  });

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      theme={isDarkMode ? "dark" : "light"}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 64,
        bottom: 0,
      }}
      trigger={
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{ width: "100%", height: 48 }}
        />
      }
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{
          height: "100%",
          borderRight: 0,
          backgroundColor: "inherit",
        }}
        items={[
          {
            type: "group",
            label: t("sidebar.main"),
            children: menuItems.main.map(getMenuItem),
          },
          {
            type: "group",
            label: t("sidebar.management"),
            children: menuItems.management.map(getMenuItem),
          },
          {
            type: "group",
            label: t("sidebar.system"),
            children: menuItems.system.map(getMenuItem),
          },
        ]}
      />
    </Sider>
  );
}
