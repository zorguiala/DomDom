import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider, Spin } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/layout/Layout";
import "./i18n/i18n";
import "./index.css";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Production = lazy(() => import("./pages/Production"));
const Sales = lazy(() => import("./pages/Sales"));
const Employees = lazy(() => import("./pages/Employees"));
const Documents = lazy(() => import("./pages/Documents"));
const Settings = lazy(() => import("./pages/Settings"));
const BOM = lazy(() => import("./pages/BOM"));

// Loading component
const LoadingFallback = () => (
  <div
    style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Spin size="large" />
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading spinner or fallback while auth state is being resolved
    return <LoadingFallback />;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StyleProvider hashPriority="high">
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#D4AF37", // Gold color for Dom Dom's brand
                borderRadius: 6,
              },
            }}
          >
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route
                              path="/production"
                              element={<Production />}
                            />
                            <Route path="/sales" element={<Sales />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/bom" element={<BOM />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ConfigProvider>
        </StyleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
