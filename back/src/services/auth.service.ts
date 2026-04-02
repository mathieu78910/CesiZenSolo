import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { prisma } from "../utils/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// Champs exposés côté API
const ACCESS_USER_FIELDS = {
  userId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isAnonymized: true
};

const hashRefreshToken = (refreshToken: string) =>
  createHash("sha256").update(refreshToken).digest("hex");

const buildTokenPayload = (user: { userId: number; role: string; email: string }) => ({
  sub: user.userId,
  role: user.role,
  email: user.email
});

const issueTokens = async (user: { userId: number; role: string; email: string }) => {
  const accessToken = signAccessToken(buildTokenPayload(user));
  const refreshToken = signRefreshToken(buildTokenPayload(user));
  await prisma.user.update({
    where: { userId: user.userId },
    data: { refreshTokenHash: hashRefreshToken(refreshToken) }
  });

  return { accessToken, refreshToken };
};

// Création d'un compte + tokens
export const registerUser = async (input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      signupDate: new Date(),
      role: "USER"
    },
    select: ACCESS_USER_FIELDS
  });

  const tokens = await issueTokens(user);

  return { user, tokens };
};

// Connexion + tokens
export const loginUser = async (input: { email: string; password: string }) => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...ACCESS_USER_FIELDS,
      refreshTokenHash: true,
      passwordHash: true
    }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (user.isAnonymized) {
    throw new Error("ACCOUNT_ANONYMIZED");
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const { passwordHash: _passwordHash, isAnonymized: _isAnonymized, ...publicUser } = user;
  const tokens = await issueTokens(publicUser);

  return { user: publicUser, tokens };
};

// Rafraîchissement via refresh token
export const refreshTokens = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  if (payload.typ && payload.typ !== "refresh") {
    throw new Error("INVALID_TOKEN");
  }

  const user = await prisma.user.findUnique({
    where: { userId: payload.sub },
    select: {
      ...ACCESS_USER_FIELDS,
      refreshTokenHash: true
    }
  });

  if (!user || user.isAnonymized || !user.refreshTokenHash) {
    throw new Error("INVALID_TOKEN");
  }

  if (user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    throw new Error("INVALID_TOKEN");
  }

  const tokens = await issueTokens(user);

  return { user, tokens };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.user.update({
      where: { userId: payload.sub },
      data: { refreshTokenHash: null }
    });
  } catch {
    // Logout must stay idempotent even with invalid/expired refresh token.
  }
};
