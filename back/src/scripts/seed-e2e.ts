import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";

const adminEmail = (process.env.E2E_ADMIN_EMAIL || "e2e@cesizen.com").toLowerCase();
const adminPassword = process.env.E2E_ADMIN_PASSWORD || "Password123!";
const userEmail = (process.env.E2E_USER_EMAIL || "e2e-user@cesizen.com").toLowerCase();
const userPassword = process.env.E2E_USER_PASSWORD || "Password123!";

const [adminHash, userHash] = await Promise.all([
  bcrypt.hash(adminPassword, 12),
  bcrypt.hash(userPassword, 12),
]);

await prisma.user.upsert({
  where: { email: adminEmail },
  create: { email: adminEmail, firstName: "E2E", lastName: "Admin", passwordHash: adminHash, signupDate: new Date(), role: "ADMIN" },
  update: { passwordHash: adminHash, role: "ADMIN" }
});

await prisma.user.upsert({
  where: { email: userEmail },
  create: { email: userEmail, firstName: "E2E", lastName: "User", passwordHash: userHash, signupDate: new Date(), role: "USER" },
  update: { passwordHash: userHash, role: "USER" }
});

console.log(`Compte ADMIN e2e prêt : ${adminEmail}`);
console.log(`Compte USER e2e prêt : ${userEmail}`);
await prisma.$disconnect();
