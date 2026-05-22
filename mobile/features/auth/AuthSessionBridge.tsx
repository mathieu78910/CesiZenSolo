import { setAuthFailureHandler } from "@back/cesizen-api";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthSessionBridge() {
  const router = useRouter();
  const segments = useSegments();
  const { clearSession } = useAuth();

  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSession();
      if (segments[0] !== "(auth)") {
        router.replace("/(auth)/login");
      }
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, [clearSession, router, segments]);

  return null;
}
