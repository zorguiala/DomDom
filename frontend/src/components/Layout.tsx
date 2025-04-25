import { Layout as AntLayout } from "antd";
import { NavBar } from "./NavBar";
import { Sidebar } from "./Sidebar";
import { useTheme } from "../context/ThemeContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();

  return (
    <AntLayout
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#141414" : "#f0f2f5",
      }}
    >
      <NavBar />
      <AntLayout hasSider>
        <Sidebar />
        <AntLayout.Content
          style={{
            marginLeft: { xs: 0, md: 200 },
            marginTop: { xs: 56, md: 64 },
            padding: { xs: 12, sm: 16, md: 24 },
            minHeight: "calc(100vh - 64px)",
            overflow: "auto",
            backgroundColor: "inherit",
            transition: "all 0.2s",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              width: "100%",
              padding: { xs: 0, sm: "0 16px" },
            }}
          >
            {children}
          </div>
        </AntLayout.Content>
      </AntLayout>
    </AntLayout>
  );
}
