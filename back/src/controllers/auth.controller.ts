import type { Request, Response } from "express";
import { loginUser, refreshTokens, registerUser, revokeRefreshToken } from "../services/auth.service.js";

// Options cookies partagées pour le refresh token
const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth"
});

const getRequestSource = (req: Request) => req.headers["x-forwarded-for"] || req.ip;

// Inscription
export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body ?? {};
  console.info("[auth][register][attempt]", { email, source: getRequestSource(req) });

  if (!email || !password || !firstName || !lastName) {
    console.warn("[auth][register][validation_failed]", {
      email,
      source: getRequestSource(req)
    });
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof password !== "string" || password.length < 8) {
    console.warn("[auth][register][validation_failed]", {
      email,
      source: getRequestSource(req),
      reason: "password_too_short"
    });
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const { user, tokens } = await registerUser({ email, password, firstName, lastName });
    res.cookie("refresh_token", tokens.refreshToken, buildCookieOptions());
    console.info("[auth][register][success]", {
      email: user.email,
      userId: user.userId,
      source: getRequestSource(req)
    });
    return res.status(201).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      console.warn("[auth][register][email_in_use]", { email, source: getRequestSource(req) });
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error("[auth][register][error]", {
      email,
      source: getRequestSource(req),
      error: error instanceof Error ? error.message : "unknown_error"
    });
    return res.status(500).json({ error: "Registration failed" });
  }
};

// Connexion
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  console.info("[auth][login][attempt]", { email, source: getRequestSource(req) });
  if (!email || !password) {
    console.warn("[auth][login][validation_failed]", { email, source: getRequestSource(req) });
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const { user, tokens } = await loginUser({ email, password });
    res.cookie("refresh_token", tokens.refreshToken, buildCookieOptions());
    console.info("[auth][login][success]", {
      email: user.email,
      userId: user.userId,
      source: getRequestSource(req)
    });
    return res.status(200).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      console.warn("[auth][login][invalid_credentials]", { email, source: getRequestSource(req) });
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (error instanceof Error && error.message === "ACCOUNT_ANONYMIZED") {
      console.warn("[auth][login][account_anonymized]", { email, source: getRequestSource(req) });
      return res.status(403).json({ error: "Account deleted" });
    }
    console.error("[auth][login][error]", {
      email,
      source: getRequestSource(req),
      error: error instanceof Error ? error.message : "unknown_error"
    });
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
export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  res.clearCookie("refresh_token", buildCookieOptions());
  return res.status(204).send();
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ error: "Missing email" });
  }

  // The project does not yet send real reset emails.
  return res.status(202).json({
    message: "Si un compte existe pour cet email, les instructions de reinitialisation seront envoyees."
  });
};
