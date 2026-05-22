import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Lecture d'env obligatoire
const getRequiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Instance Prisma avec driver adapter (Prisma v7)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: getRequiredEnv("DATABASE_URL")
      })
    )
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
