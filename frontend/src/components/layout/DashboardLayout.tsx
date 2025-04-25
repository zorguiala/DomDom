import React, { useState } from "react";
import { Layout, Menu, Button, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  ShopOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout as CurrentLayout } from "./Layout";

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: JSX.Element;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: t("home.title") },
    { key: "/inventory", icon: <ShopOutlined />, label: t("inventory.title") },
    {
      key: "/production",
      icon: <ToolOutlined />,
      label: t("production.title"),
    },
    { key: "/sales", icon: <ShoppingCartOutlined />, label: t("sales.title") },
    { key: "/employees", icon: <TeamOutlined />, label: t("employees.title") },
    { key: "/documents", icon: <FileOutlined />, label: t("documents.title") },
    { key: "/reminders", icon: <BellOutlined />, label: t("reminders.title") },
    { key: "/settings", icon: <SettingOutlined />, label: t("settings.title") },
  ];

  return (
    <CurrentLayout>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div
            style={{
              height: 32,
              margin: 16,
              background: token.colorPrimary,
              borderRadius: token.borderRadius,
            }}
          />
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout
          style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
        >
          <Header
            style={{
              padding: "0 16px",
              background: token.colorBgContainer,
              display: "flex",
              alignItems: "center",
              position: "sticky",
              top: "65px",
              zIndex: 1,
              width: "100%",
              borderRadius: "5px",
              margin: "0px 16px",
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </CurrentLayout>
  );
};

export default DashboardLayout;
