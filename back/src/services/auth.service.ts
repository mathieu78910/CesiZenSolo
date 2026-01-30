import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// Champs exposés côté API
const ACCESS_USER_FIELDS = {
  userId: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true
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

  const tokens = {
    accessToken: signAccessToken({
      sub: user.userId,
      role: user.role,
      email: user.email
    }),
    refreshToken: signRefreshToken({
      sub: user.userId,
      role: user.role,
      email: user.email
    })
  };

  return { user, tokens };
};

// Connexion + tokens
export const loginUser = async (input: { email: string; password: string }) => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...ACCESS_USER_FIELDS,
      passwordHash: true
    }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  const tokens = {
    accessToken: signAccessToken({
      sub: publicUser.userId,
      role: publicUser.role,
      email: publicUser.email
    }),
    refreshToken: signRefreshToken({
      sub: publicUser.userId,
      role: publicUser.role,
      email: publicUser.email
    })
  };

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
    select: ACCESS_USER_FIELDS
  });

  if (!user) {
    throw new Error("INVALID_TOKEN");
  }

  const tokens = {
    accessToken: signAccessToken({
      sub: user.userId,
      role: user.role,
      email: user.email
    }),
    refreshToken: signRefreshToken({
      sub: user.userId,
      role: user.role,
      email: user.email
    })
  };

  return { user, tokens };
};
