import { Layout as AntLayout, theme } from "antd";
import { NavBar } from "./NavBar";
import { Sidebar } from "./Sidebar";

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: JSX.Element;
}

export function Layout({ children }: LayoutProps) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0, background: colorBgContainer, zIndex: 10 }}>
        <NavBar />
      </Header>
      <AntLayout>
        <Sider width={220} style={{ background: colorBgContainer }}>
          <Sidebar />
        </Sider>
        <Content
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: 24,
            minHeight: 280,
            margin: 24,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
