// Routes utilisateurs (CRUD).
// Rôle: mapper les endpoints HTTP vers les handlers.
import { Router } from "express";
import { createUser, deleteUser, getUserById, listUsers, updateUser } from "../controllers/user.controller.js";
import { authenticateJWT, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// CREATE (admin only)
router.post("/", authenticateJWT, requireRole("ADMIN"), createUser);

// READ (liste + détail - admin only)
router.get("/", authenticateJWT, requireRole("ADMIN"), listUsers);
router.get("/:userId", authenticateJWT, requireRole("ADMIN"), getUserById);

// UPDATE (admin only)
router.patch("/:userId", authenticateJWT, requireRole("ADMIN"), updateUser);

// DELETE (admin only)
router.delete("/:userId", authenticateJWT, requireRole("ADMIN"), deleteUser);

export default router;
