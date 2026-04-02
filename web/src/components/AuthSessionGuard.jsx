import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAccessTokenRefreshedHandler, setAuthFailureHandler } from "@back/cesizen-api";
import { clearAuth, loadAuth, saveAuth } from "../utils/auth.js";

export default function AuthSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setAccessTokenRefreshedHandler(({ accessToken, user }) => {
      const currentAuth = loadAuth();
      if (!currentAuth) return;

      saveAuth({
        accessToken,
        user: user ?? currentAuth.user
      });
    });

    setAuthFailureHandler(({ message }) => {
      clearAuth();
      if (location.pathname !== "/login") {
        navigate("/login", {
          replace: true,
          state: { authError: message || "Session expirée" }
        });
      }
    });

    return () => {
      setAccessTokenRefreshedHandler(null);
      setAuthFailureHandler(null);
    };
  }, [location.pathname, navigate]);

  return null;
}
