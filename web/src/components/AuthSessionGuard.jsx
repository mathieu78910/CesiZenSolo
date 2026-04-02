import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuthFailureHandler } from "@back/cesizen-api";
import { clearAuth } from "../utils/auth.js";

export default function AuthSessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
      setAuthFailureHandler(null);
    };
  }, [location.pathname, navigate]);

  return null;
}
