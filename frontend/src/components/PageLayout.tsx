import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { NavBar } from "./NavBar";

const { Content } = Layout;
const { Title } = Typography;

interface PageLayoutProps {
  children: JSX.Element;
  title: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      <NavBar />
      <Content style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2}>{t(title)}</Title>
        {children}
      </Content>
    </Layout>
  );
}
