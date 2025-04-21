import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingState } from "./components/LoadingState";
import { Sidebar } from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import "./i18n/i18n";

// Lazy load other pages
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Production = React.lazy(() => import("./pages/Production"));
const Sales = React.lazy(() => import("./pages/Sales"));
const Employees = React.lazy(() => import("./pages/Employees"));
const Documents = React.lazy(() => import("./pages/Documents"));
const Reminders = React.lazy(() => import("./pages/Reminders"));
const Settings = React.lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingState />}>{children}</React.Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CssBaseline />
          <BrowserRouter>
            <Box sx={{ display: "flex", minHeight: "100vh" }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Sidebar />
                      <Box
                        component="main"
                        sx={{ flexGrow: 1, bgcolor: "background.default" }}
                      >
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <PageWrapper>
                                <Home />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/inventory"
                            element={
                              <PageWrapper>
                                <Inventory />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/production"
                            element={
                              <PageWrapper>
                                <Production />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/sales"
                            element={
                              <PageWrapper>
                                <Sales />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/employees"
                            element={
                              <PageWrapper>
                                <Employees />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/documents"
                            element={
                              <PageWrapper>
                                <Documents />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/reminders"
                            element={
                              <PageWrapper>
                                <Reminders />
                              </PageWrapper>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <PageWrapper>
                                <Settings />
                              </PageWrapper>
                            }
                          />
                        </Routes>
                      </Box>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
