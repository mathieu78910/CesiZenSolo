import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type AuthUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  isAnonymized?: boolean;
  anonymizedAt?: string | null;
};

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

type AuthContextValue = {
  session: AuthSession | null;
  setSession: (nextSession: AuthSession) => void;
  clearSession: () => void;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession: (nextSession) => setSessionState(nextSession),
      clearSession: () => setSessionState(null),
      updateUser: (user) =>
        setSessionState((current) => (current ? { ...current, user } : current)),
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
