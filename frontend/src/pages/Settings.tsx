import { Card, Space, Switch, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";
import DashboardLayout from "../components/layout/DashboardLayout";

const { Title } = Typography;

export default function Settings() {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1200, margin: "32px auto", padding: "0 16px" }}>
        <Title level={2}>{t("settings.title")}</Title>

        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" size="large">
            <div>
              <Title level={4}>{t("settings.language")}</Title>
              <LanguageSwitcher />
            </div>

            <div>
              <Title level={4}>{t("settings.theme")}</Title>
              <Space>
                <Switch checked={isDarkMode} onChange={toggleTheme} />
                <span>{t("settings.darkMode")}</span>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </DashboardLayout>
  );
}
