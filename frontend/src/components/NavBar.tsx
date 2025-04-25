import { Layout, Button, Space, Typography, Avatar, Dropdown } from "antd";
import {
  BulbOutlined,
  BulbFilled,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

const { Header } = Layout;

export function NavBar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: t("auth.profile"),
        onClick: () => navigate("/settings"),
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: t("auth.logout"),
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header
      style={{
        position: "fixed",
        width: "100%",
        zIndex: 1000,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDarkMode ? "#141414" : "#001529",
        borderBottom: `1px solid ${isDarkMode ? "#303030" : "#1f1f1f"}`,
        height: { xs: 56, md: 64 },
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Typography.Title level={4} style={{ margin: 0, color: "#D4AF37" }}>
          DomDom
        </Typography.Title>
        <Typography.Text
          style={{ color: "#8c8c8c", display: { xs: "none", sm: "inline" } }}
        >
          Enterprise Resource Planning
        </Typography.Text>
      </div>

      {user && (
        <Space size="middle" align="center">
          <LanguageSwitcher />

          <Button
            type="text"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            style={{ color: "#fff" }}
          />

          <Dropdown menu={userMenuItems} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: "#D4AF37" }}
                icon={<UserOutlined />}
              />
              <Typography.Text
                style={{
                  color: "#fff",
                  display: { xs: "none", sm: "inline" },
                }}
              >
                {user.firstName}
              </Typography.Text>
            </Space>
          </Dropdown>
        </Space>
      )}
    </Header>
  );
}
