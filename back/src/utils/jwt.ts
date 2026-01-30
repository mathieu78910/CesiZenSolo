import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

type JwtUserPayload = {
  sub: number;
  role: string;
  email: string;
};

// Lecture d'env obligatoire
const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

// Access token (court)
export const signAccessToken = (payload: JwtUserPayload) => {
  const secret = getRequiredEnv("JWT_ACCESS_SECRET");
  const expiresIn = process.env.JWT_ACCESS_EXPIRES ?? "15m";
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
};

// Refresh token (long)
export const signRefreshToken = (payload: JwtUserPayload) => {
  const secret = getRequiredEnv("JWT_REFRESH_SECRET");
  const expiresIn = process.env.JWT_REFRESH_EXPIRES ?? "7d";
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ ...payload, typ: "refresh" }, secret, options);
};

// Vérification du refresh token
export const verifyRefreshToken = (token: string) => {
  const secret = getRequiredEnv("JWT_REFRESH_SECRET");
  const decoded = jwt.verify(token, secret) as JwtPayload | string;
  if (typeof decoded === "string") {
    throw new Error("INVALID_TOKEN");
  }
  return decoded as unknown as JwtUserPayload & { typ?: string };
};
