import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) {
      // If using Axios, set default Authorization header
      if (authApi.setToken) {
        authApi.setToken(token);
      } else {
        console.warn("Auth context: setToken method not found on authApi");
      }

      setIsLoading(true);
      authApi
        .getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        })
        .catch((err) => {
          console.error("Auth context: Failed to fetch profile", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });

      if (response && response.access_token) {
        setToken(response.access_token);
        localStorage.setItem("token", response.access_token);
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e) {
      console.error("Login error:", e);
      setError(e as Error);
      throw e;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setError(null);
      const response = await authApi.register(data);
      setToken(response.access_token);
      localStorage.setItem("token", response.access_token);
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
