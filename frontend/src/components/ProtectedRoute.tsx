import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    console.warn("ProtectedRoute: No user, redirecting to /login", {
      location: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
