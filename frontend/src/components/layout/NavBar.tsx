import { Layout, Button, Space, Typography, Switch, theme } from "antd";
import {
  LogoutOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { LanguageSwitcher } from "../LanguageSwitcher";

const { Header } = Layout;
const { Text } = Typography;

export function NavBar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Header
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: colorBgContainer,
        padding: '0 24px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        DomDom
      </Typography.Title>

      {user && (
        <Space size="middle">
          <LanguageSwitcher />
          
          <Switch
            checkedChildren={<BulbFilled />}
            unCheckedChildren={<BulbOutlined />}
            defaultChecked
          />

          <Text>
            {t("common.welcome")}, {user.firstName}
          </Text>

          <Button 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            {t("auth.logout")}
          </Button>
        </Space>
      )}
    </Header>
  );
} 