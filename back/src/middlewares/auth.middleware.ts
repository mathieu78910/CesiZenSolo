// Middleware d'authentification JWT.
// Rôle: vérifier le token access et injecter req.user.
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

// Payload attendu dans le JWT access token
type JwtUserPayload = {
  sub: number;
  role: string;
  email: string;
};

const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Récupère le token dans l'en-tête Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // Supprime le préfixe "Bearer "
  const token = authHeader.slice(7);
  try {
    // Vérifie le token avec le secret d'accès
    const secret = getRequiredEnv("JWT_ACCESS_SECRET");
    const decoded = jwt.verify(token, secret) as JwtPayload | string;
    if (typeof decoded === "string") {
      return res.status(401).json({ message: "Token invalide" });
    }

    const payload = decoded as unknown as JwtUserPayload;
    // Injection du user dans req pour les handlers suivants
    req.user = {
      userId: payload.sub,
      role: payload.role,
      email: payload.email
    };

    // Passe au handler suivant
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Middleware d'autorisation: vérifie le rôle requis (ex: ADMIN)
export const requireRole = (role: "ADMIN" | "USER") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Accès interdit" });
    }
    return next();
  };
};
