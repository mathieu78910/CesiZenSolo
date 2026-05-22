// Service utilisateurs (logique métier + accès Prisma).
// Rôle: centraliser le CRUD et protéger les données sensibles.
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { CreateUserInput, UpdateUserInput } from "../validators/user.validator.js";
import { prisma } from "../utils/prisma.js";

// Champs publics autorisés à être renvoyés à l'API
const PUBLIC_USER_SELECT = {
  userId: true,
  firstName: true,
  lastName: true,
  email: true,
  signupDate: true,
  role: true,
  isAnonymized: true,
  anonymizedAt: true
} satisfies Prisma.UserSelect;

function buildAnonymizedEmail(userId: number): string {
  return `deleted-user-${userId}-${randomUUID()}@cesizen.invalid`;
}

function buildAnonymizedIdentity(userId: number) {
  return {
    firstName: "Utilisateur",
    lastName: `supprime-${userId}`,
    email: buildAnonymizedEmail(userId)
  };
}

// Liste paginée des utilisateurs + recherche optionnelle
export const listUsers = async (input?: { page?: number; limit?: number; search?: string }) => {
  // Pagination avec valeurs par défaut
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 20;
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 || limit > 100 ? 20 : limit;
  const skip = (safePage - 1) * safeLimit;

  // Recherche simple (email / prénom / nom)
  const search = input?.search?.trim();
  const where: Prisma.UserWhereInput = search
    ? {
        isAnonymized: false,
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } }
        ]
      }
    : { isAnonymized: false };

  // Récupération + total pour la pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { userId: "asc" },
      select: PUBLIC_USER_SELECT
    }),
    prisma.user.count({ where })
  ]);

  return { users, total, page: safePage, limit: safeLimit };
};

// Retourne un utilisateur par ID (ou erreur si absent)
export const getUserById = async (userId: number) => {
  const user = await prisma.user.findFirst({
    where: { userId, isAnonymized: false },
    select: PUBLIC_USER_SELECT
  });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
};

// Création d'un utilisateur (unicité email + hash password)
export const createUser = async (input: CreateUserInput) => {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { userId: true }
  });
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      passwordHash,
      signupDate: new Date(),
      role: input.role ?? "USER"
    },
    select: PUBLIC_USER_SELECT
  });

  return user;
};

// Mise à jour partielle (patch) + hash si password fourni
export const updateUser = async (userId: number, input: UpdateUserInput) => {
  const existingById = await prisma.user.findUnique({
    where: { userId },
    select: { userId: true, isAnonymized: true }
  });
  if (!existingById) {
    throw new Error("USER_NOT_FOUND");
  }
  if (existingById.isAnonymized) {
    throw new Error("USER_ANONYMIZED");
  }

  if (input.email) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { userId: true }
    });
    if (existing && existing.userId !== userId) {
      throw new Error("EMAIL_IN_USE");
    }
  }

  const data: Prisma.UserUpdateInput = {
    ...(input.firstName ? { firstName: input.firstName } : {}),
    ...(input.lastName ? { lastName: input.lastName } : {}),
    ...(input.email ? { email: input.email.toLowerCase() } : {}),
    ...(input.role ? { role: input.role } : {})
  };

  // Re-hash si mot de passe fourni
  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 12);
  }

  const user = await prisma.user.update({
    where: { userId },
    data,
    select: PUBLIC_USER_SELECT
  });

  return user;
};

// Anonymisation d'un utilisateur "supprime" afin de conserver l'historique
export const deleteUser = async (userId: number) => {
  const existing = await prisma.user.findUnique({
    where: { userId },
    select: { userId: true, role: true, isAnonymized: true }
  });
  if (!existing) {
    throw new Error("USER_NOT_FOUND");
  }
  if (existing.isAnonymized) {
    return true;
  }

  const anonymized = buildAnonymizedIdentity(userId);
  const disabledPasswordHash = await bcrypt.hash(randomUUID(), 12);

  await prisma.user.update({
    where: { userId },
    data: {
      firstName: anonymized.firstName,
      lastName: anonymized.lastName,
      email: anonymized.email,
      passwordHash: disabledPasswordHash,
      role: "USER",
      isAnonymized: true,
      anonymizedAt: new Date()
    }
  });

  return true;
};
