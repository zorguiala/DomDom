import { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: JSX.Element }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#D4AF37", // Gold color for Dom Dom's brand
      borderRadius: 6,
      colorBgBase: isDarkMode ? "#141414" : "#ffffff",
      colorTextBase: isDarkMode
        ? "rgba(255, 255, 255, 0.85)"
        : "rgba(0, 0, 0, 0.85)",
      colorBorder: isDarkMode ? "#303030" : "#d9d9d9",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    },
    components: {
      Layout: {
        bodyBg: isDarkMode ? "#141414" : "#f0f2f5",
        headerBg: isDarkMode ? "#1f1f1f" : "#001529",
        siderBg: isDarkMode ? "#1f1f1f" : "#001529",
        headerHeight: 64,
        headerPadding: "0 24px",
      },
      Menu: {
        itemBg: "transparent",
        subMenuItemBg: "transparent",
        itemSelectedBg: isDarkMode
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.06)",
        itemHoverBg: isDarkMode
          ? "rgba(255, 255, 255, 0.04)"
          : "rgba(0, 0, 0, 0.03)",
      },
      Card: {
        colorBgContainer: isDarkMode ? "#1f1f1f" : "#ffffff",
        boxShadow:
          "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
      },
      Button: {
        borderRadius: 6,
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
