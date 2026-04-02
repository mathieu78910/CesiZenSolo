import { setApiBaseUrl } from "@back/cesizen-api";
import { Slot } from "expo-router";
import { Platform } from "react-native";
import { AuthProvider } from "../features/auth/AuthProvider";
import AuthSessionBridge from "../features/auth/AuthSessionBridge";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (configuredBaseUrl) {
  setApiBaseUrl(configuredBaseUrl);
} else if (__DEV__) {
  // Default dev targets when no env var is provided.
  setApiBaseUrl(Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");
}

const RootLayout = () => {
  return (
    <AuthProvider>
      <AuthSessionBridge />
      <Slot />
    </AuthProvider>
  );
};

export default RootLayout;
