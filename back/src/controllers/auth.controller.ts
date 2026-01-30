import type { Request, Response } from "express";
import { loginUser, refreshTokens, registerUser } from "../services/auth.service.js";

// Options cookies partagées pour le refresh token
const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth"
});

// Inscription
export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body ?? {};
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const { user, tokens } = await registerUser({ email, password, firstName, lastName });
    res.cookie("refresh_token", tokens.refreshToken, buildCookieOptions());
    return res.status(201).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return res.status(409).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
};

// Connexion
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const { user, tokens } = await loginUser({ email, password });
    res.cookie("refresh_token", tokens.refreshToken, buildCookieOptions());
    return res.status(200).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.status(500).json({ error: "Login failed" });
  }
};

// Renouvellement des tokens via cookie httpOnly
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const { user, tokens } = await refreshTokens(refreshToken);
    res.cookie("refresh_token", tokens.refreshToken, buildCookieOptions());
    return res.status(200).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

// Déconnexion (suppression du cookie)
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("refresh_token", buildCookieOptions());
  return res.status(204).send();
};
