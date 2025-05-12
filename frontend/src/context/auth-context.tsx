import type { loginSchema } from "@/pages/Login";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface UserProps {
  email: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: UserProps | null;
  loginLoading: boolean;
  loginUser: (form: z.infer<typeof loginSchema>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export default AuthContext;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    const storedTokens = localStorage.getItem("authTokens");
    return storedTokens ? JSON.parse(storedTokens) : null;
  });
  const [user, setUser] = useState<UserProps | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Initialize user from tokens on mount
  useEffect(() => {
    if (authTokens) {
      const decoded = jwtDecode<UserProps>(authTokens.access);
      setUser(decoded);
    }
  }, [authTokens]);

  // Axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          authTokens?.refresh
        ) {
          originalRequest._retry = true;

          try {
            const response = await axios.post("/api/auth/token/refresh/", {
              refresh: authTokens.refresh,
            });

            const newTokens = {
              access: response.data.access,
              refresh: authTokens.refresh,
            };

            setAuthTokens(newTokens);
            localStorage.setItem("authTokens", JSON.stringify(newTokens));
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logoutUser();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authTokens]);

  // Add auth token to all requests
  useEffect(() => {
    if (authTokens) {
      axios.defaults.headers.common.Authorization = `Bearer ${authTokens.access}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [authTokens]);

  // This is a function to login
  const loginUser = async (form: z.infer<typeof loginSchema>) => {
    setLoginLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/token/",
        {
          username: form.username,
          password: form.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const tokens = response.data;
      setAuthTokens(tokens);
      localStorage.setItem("authTokens", JSON.stringify(tokens));

      const decoded = jwtDecode<UserProps>(tokens.access);
      setUser(decoded);

      navigate("/");
      toast.success("Login successful!");
      alert("Login successful!");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Please try again.";
      alert(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  // This is a function to logout
  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("profile");
    navigate("/auth");
  }, [navigate]);

  const contextValue = {
    user,
    loginLoading,
    loginUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
