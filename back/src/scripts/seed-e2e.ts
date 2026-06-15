import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";

// Crée (ou met à jour) un compte ADMIN utilisé par les tests end-to-end.
// Idempotent : peut être exécuté à chaque run de la suite e2e.
const email = (process.env.E2E_ADMIN_EMAIL || "e2e@cesizen.com").toLowerCase();
const password = process.env.E2E_ADMIN_PASSWORD || "Password123!";

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  create: {
    email,
    firstName: "E2E",
    lastName: "Admin",
    passwordHash,
    signupDate: new Date(),
    role: "ADMIN"
  },
  update: {
    passwordHash,
    role: "ADMIN"
  }
});

console.log(`Compte ADMIN e2e prêt : ${email}`);
await prisma.$disconnect();
