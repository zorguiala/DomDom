import { ReactNode } from "react";
import { Layout as AntLayout, theme } from "antd";
import { NavBar } from "./NavBar";
import { Sidebar } from "./Sidebar";

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <NavBar />
      <AntLayout>
        <Sidebar />
        <AntLayout style={{ padding: "24px" }}>
          <Content
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: 24,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
} 